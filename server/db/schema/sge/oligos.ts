import { sql } from 'drizzle-orm/sql'
import { pgTable, uuid, varchar, text, check, integer, timestamp, doublePrecision} from 'drizzle-orm/pg-core'
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
    haPcrProductId: uuid('ha_pcr_product_id').references(() => haPcrProducts.id).notNull(),
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
    haPuc19PcrProductId: uuid('ha_puc19_pcr_product_id').references(() => haPuc19PcrProducts.id).notNull(),
    puc19VectorConcentration: doublePrecision('puc19_vector_concentration'),
    puc19VectorAmount: doublePrecision('puc19_vector_amount').default(50),
    preppedOn: timestamp('prepped_on'),
    preppedBy: uuid('prepped_by').references(() => users.id),
    quant: doublePrecision('quant'),
    notes: text('notes'),
})
