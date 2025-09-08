import { sql } from 'drizzle-orm/sql'
import { pgTable, uuid, varchar, text, check, integer, timestamp, doublePrecision, pgView} from 'drizzle-orm/pg-core'
import { targets } from './target'
import { haCloningExperiments } from './plasmid-experiment'
import { homologyArmPrimers, homologyArmPuc19Primers } from './primer'
import { users } from '../user'

export const sgRnaOligos = pgTable('sg_rna_oligos', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    targetId: uuid('target_id').references(() => targets.id),
    name: varchar('name', { length: 255 }).notNull().unique(),
    sequence: varchar('sequence', { length: 255 }),
    direction: varchar('direction', {enum: ['forward', 'reverse']}),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]*$'`),
])

export const haPcrProducts = pgTable('ha_pcr_products', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    haCloningExperimentId: uuid('ha_cloning_experiment_id').references(() => haCloningExperiments.id).unique(),
    startPosition: integer('start_position'),
    stopPosition: integer('stop_position'),
    haPrimerForwardId: uuid('ha_primer_forward_id').references(() => homologyArmPrimers.id).notNull(),
    haPrimerReverseId: uuid('ha_primer_reverse_id').references(() => homologyArmPrimers.id).notNull(),
    wtHap1DnaConcentration: doublePrecision('wt_hap1_dna_concentration'),
    temperatureChosen: doublePrecision('temperature_chosen'),
    performedOn: timestamp('performed_on'),
    performedBy: uuid('performed_by').references(() => users.id),
    notes: text('notes'),
})

export const haPuc19PcrProducts = pgTable('ha_puc19_pcr_products', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    haPcrProductId: uuid('ha_pcr_product_id').references(() => haPcrProducts.id).notNull().unique(),
    haPuc19PrimerForwardId: uuid('ha_puc19_primer_forward_id').references(() => homologyArmPuc19Primers.id).notNull(),
    haPuc19PrimerReverseId: uuid('ha_puc19_primer_reverse_id').references(() => homologyArmPuc19Primers.id).notNull(),
    temperatureUsed: doublePrecision('temperature_used'),
    cleanedOn: timestamp('cleaned_on'),
    cleanedBy: uuid('cleaned_by').references(() => users.id),
    quant: doublePrecision('quant'),
    notes: text('notes'),
})

export const haPuc19GibsonProducts = pgTable('ha_puc19_gibson_products', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    haPuc19PcrProductId: uuid('ha_puc19_pcr_product_id').references(() => haPuc19PcrProducts.id).notNull().unique(),
    puc19VectorConcentration: doublePrecision('puc19_vector_concentration'),
    puc19VectorAmount: doublePrecision('puc19_vector_amount').default(50),
    preppedOn: timestamp('prepped_on'),
    preppedBy: uuid('prepped_by').references(() => users.id),
    quant: doublePrecision('quant'),
    notes: text('notes'),
})

export const viewHaPuc19GibsonProductsWithCalcs = pgView('view_ha_puc19_gibson_products_with_calcs', {
    id: uuid('id'),
    name: varchar('name', { length: 255 }),
    haPuc19PcrProductId: uuid('ha_puc19_pcr_product_id'),
    haPuc19PcrProductName: varchar('ha_puc19_pcr_product_name', { length: 255 }),
    puc19VectorAmount: doublePrecision('puc19_vector_amount'),
    puc19VectorConcentration: doublePrecision('puc19_vector_concentration'),
    quant: doublePrecision('quant'),
    preppedOn: timestamp('prepped_on'),
    preppedByName: varchar('prepped_by_name', { length: 255 }),
    haCloningExperimentId: uuid('ha_cloning_experiment_id'),
    haCloningExperimentName: varchar('ha_cloning_experiment_name', { length: 255 }),
    haPcrProductId: uuid('ha_pcr_product_id'),
    haPcrProductName: varchar('ha_pcr_product_name', { length: 255 }),
    haPcrProductLength: integer('ha_pcr_product_length'),
    insertDnaMass: doublePrecision('insert_dna_mass'),
    insertVolume: doublePrecision('insert_volume'),
    vectorVolume: doublePrecision('vector_volume'),
    notes: text('notes'),
}).as(sql`SELECT
    ${haPuc19GibsonProducts.id} AS id,
    ${haPuc19GibsonProducts.name} AS name,
    ${haPuc19PcrProducts.id} AS ha_puc19_pcr_product_id,
    ${haPuc19PcrProducts.name} AS ha_puc19_pcr_product_name,
    ${haPuc19GibsonProducts.puc19VectorAmount} AS puc19_vector_amount,
    ${haPuc19GibsonProducts.puc19VectorConcentration} AS puc19_vector_concentration,
    ${haPuc19GibsonProducts.quant} AS quant,
    ${haPuc19GibsonProducts.preppedOn} AS prepped_on,
    ${users.name} AS prepped_by_name,
    ${haCloningExperiments.id} AS ha_cloning_experiment_id,
    ${haCloningExperiments.name} AS ha_cloning_experiment_name,
    t_ha_pcr_products.id AS ha_pcr_product_id,
    t_ha_pcr_products.name AS ha_pcr_product_name,
    t_ha_pcr_products.ha_pcr_product_length AS ha_pcr_product_length,
    CASE
        WHEN ${haPuc19GibsonProducts.puc19VectorAmount} IS NOT NULL AND t_ha_pcr_products.ha_pcr_product_length IS NOT NULL
            THEN t_ha_pcr_products.ha_pcr_product_length / 2649.0 * ${haPuc19GibsonProducts.puc19VectorAmount} * 2.0
        ELSE NULL
    END AS insert_dna_mass,
    CASE
        WHEN ${haPuc19GibsonProducts.puc19VectorAmount} IS NOT NULL AND t_ha_pcr_products.ha_pcr_product_length IS NOT NULL AND ${haPuc19GibsonProducts.quant} IS NOT NULL
            THEN t_ha_pcr_products.ha_pcr_product_length / 2649.0 * ${haPuc19GibsonProducts.puc19VectorAmount} * 2.0 / ${haPuc19GibsonProducts.quant}
        ELSE NULL
    END AS insert_volume,
    CASE
        WHEN ${haPuc19GibsonProducts.puc19VectorAmount} IS NOT NULL AND ${haPuc19GibsonProducts.puc19VectorConcentration} IS NOT NULL
            THEN ${haPuc19GibsonProducts.puc19VectorAmount} / ${haPuc19GibsonProducts.puc19VectorConcentration}
        ELSE NULL
    END AS vector_volume,
    ${haPuc19GibsonProducts.notes} AS notes
FROM ${haPuc19GibsonProducts}
    JOIN ${haPuc19PcrProducts} ON ${haPuc19PcrProducts.id} = ${haPuc19GibsonProducts.haPuc19PcrProductId}
    JOIN (
        SELECT
            ${haPcrProducts.id} AS id,
            ${haPcrProducts.name} AS name,
            ${haPcrProducts.haCloningExperimentId} AS ha_cloning_experiment_id,
            CASE
                WHEN ${haPcrProducts.startPosition} IS NOT NULL AND ${haPcrProducts.stopPosition} IS NOT NULL
                    THEN ${haPcrProducts.stopPosition} - ${haPcrProducts.startPosition} + 1
                ELSE NULL
            END AS ha_pcr_product_length
        FROM  ${haPcrProducts}
    ) AS t_ha_pcr_products ON t_ha_pcr_products.id = ${haPuc19PcrProducts.haPcrProductId}
    JOIN ${haCloningExperiments} ON ${haCloningExperiments.id} = t_ha_pcr_products.ha_cloning_experiment_id
    JOIN ${users} ON ${users.id} = ${haPuc19GibsonProducts.preppedBy}`)
