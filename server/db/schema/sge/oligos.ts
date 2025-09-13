import { sql } from 'drizzle-orm/sql'
import { pgTable, uuid, varchar, text, check, integer, timestamp, doublePrecision, pgView, boolean} from 'drizzle-orm/pg-core'
import { targets } from './target'
import { haCloningExperiments, snvLibCloningExperiments } from './plasmid-experiment'
import { amplificationPrimers, homologyArmPrimers, homologyArmPuc19Primers, linearizationPrimers } from './primer'
import { users } from '../user'
import { lots } from './lots'
import { haPuc19Plasmids } from './plasmid'

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

export const snvLibAmpProducts = pgTable('snv_lib_amp_products', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    snvLibCloningExperimentId: uuid('snv_lib_cloning_experiment_id').references(() => snvLibCloningExperiments.id).unique(),
    twistLotId: uuid('twist_lot_id').references(() => lots.id),
    ampPrimerForwardId: uuid('amp_primer_forward_id').references(() => amplificationPrimers.id).notNull(),
    ampPrimerReverseId: uuid('amp_primer_reverse_id').references(() => amplificationPrimers.id).notNull(),
    cleanedOn: timestamp('cleaned_on'),
    cleanedBy: uuid('cleaned_by').references(() => users.id),
    quant: doublePrecision('quant'),
    startPosition: integer('start_position'),
    stopPosition: integer('stop_position'),
    notes: text('notes'),
})

export const snvLibLinProducts = pgTable('snv_lib_lin_products', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    snvLibCloningExperimentId: uuid('snv_lib_cloning_experiment_id').references(() => snvLibCloningExperiments.id).unique(),
    haPuc19PlasmidId: uuid('ha_puc19_plasmid_id').references(() => haPuc19Plasmids.id).notNull(),
    linPrimerForwardId: uuid('lin_primer_forward_id').references(() => linearizationPrimers.id).notNull(),
    linPrimerReverseId: uuid('lin_primer_reverse_id').references(() => linearizationPrimers.id).notNull(),
    dpn1DigestOn: timestamp('dpn1_digest_on'),
    dpn1DigestBy: uuid('dpn1_digest_by').references(() => users.id),
    gelExtractedOn: timestamp('gel_extracted_on'),
    gelExtractedBy: uuid('gel_extracted_by').references(() => users.id),
    quant: doublePrecision('quant'),
    notes: text('notes'),
})

export const snvLibGibsonProducts = pgTable('snv_lib_gibson_products', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    snvLibCloningExperimentId: uuid('snv_lib_cloning_experiment_id').references(() => snvLibCloningExperiments.id).unique(),
    linProductVectorAmount: doublePrecision('lin_product_vector_amount').default(50),
    gibsonOn: timestamp('gibson_on'),
    gibsonBy: uuid('gibson_by').references(() => users.id),
    cleanedOn: timestamp('cleaned_on'),
    cleanedBy: uuid('cleaned_by').references(() => users.id),
    transformedOn: timestamp('transformed_on'),
    transformedBy: uuid('transformed_by').references(() => users.id),
    preppedOn: timestamp('prepped_on'),
    preppedBy: uuid('prepped_by').references(() => users.id),
    quant: doublePrecision('quant'),
    plasmidsaurusChecked: boolean('plasmidsaurus_checked').default(false),
    ngsChecked: boolean('ngs_checked').default(false),
    passedQc: boolean('passed_qc').default(false),
    benchlingLink: text('benchling_link'),
    notes: text('notes'),
}, (table) => [
  check("benchling_link_check", sql`${table.benchlingLink} ~* '^https?://.+$'`),
])

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

export const snvLibGibsonProductsView = pgView('snv_lib_gibson_products_view', {
    id: uuid('id'),
    name: varchar('name', { length: 255 }),
    snvLibCloningExperimentId: uuid('snv_lib_cloning_experiment_id'),
    snvLibCloningExperimentName: varchar('snv_lib_cloning_experiment_name', { length: 255 }),
    ampProductId: uuid('amp_product_id'),
    ampProductName: varchar('amp_product_name', { length: 255 }),
    ampProductSize: integer('amp_product_size'),
    ampProductConcentration: doublePrecision('amp_product_concentration'),
    linProductId: uuid('lin_product_id'),
    linProductName: varchar('lin_product_name', { length: 255 }),
    linProductConcentration: doublePrecision('lin_product_concentration'),
    linProductSize: integer('lin_product_size'),
    ampProductVectorAmount: doublePrecision('amp_product_vector_amount'),
    linProductVectorAmount: doublePrecision('lin_product_vector_amount'),
    gibsonOn: timestamp('gibson_on'),
    gibsonByName: varchar('gibson_by_name', { length: 255 }),
    cleanedOn: timestamp('cleaned_on'),
    cleanedByName: varchar('cleaned_by_name', { length: 255 }),
    transformedOn: timestamp('transformed_on'),
    transformedByName: varchar('transformed_by_name', { length: 255 }),
    preppedOn: timestamp('prepped_on'),
    preppedByName: varchar('prepped_by_name', { length: 255 }),
    quant: doublePrecision('quant'),
    plasmidsaurusChecked: boolean('plasmidsaurus_checked'),
    ngsChecked: boolean('ngs_checked'),
    passedQc: boolean('passed_qc'),
    benchlingLink: text('benchling_link'),
    notes: text('notes'),
    ampVolume: doublePrecision('amp_volume'),
    linVolume: doublePrecision('lin_volume'),
    totalVolume: doublePrecision('total_volume'),
}).as(sql`SELECT
    *,
	amp_volume,
	lin_volume,
	CASE
		WHEN amp_volume IS NOT NULL AND lin_volume IS NOT NULL
		THEN amp_volume + lin_volume
		ELSE NULL
	END AS total_volume
FROM (
	SELECT *,
	CASE
		WHEN amp_product_vector_amount IS NOT NULL AND amp_product_concentration != 0
		THEN amp_product_vector_amount / amp_product_concentration
		ELSE NULL
	END AS amp_volume,
	CASE
		WHEN lin_product_vector_amount IS NOT NULL AND lin_product_concentration != 0
		THEN lin_product_vector_amount / lin_product_concentration
		ELSE NULL
	END AS lin_volume
FROM (
	SELECT
	${snvLibGibsonProducts}.*,
	${snvLibCloningExperiments.name} AS snv_lib_cloning_experiment_name,
	amp_products.id AS amp_product_id,
	amp_products.name AS amp_product_name,
	amp_products.amp_product_size AS amp_product_size,
	amp_products.quant AS amp_product_concentration,
	lin_products.id AS lin_product_id,
	lin_products.name AS lin_product_name,
	lin_products.quant AS lin_product_concentration,
	lin_products.ha_pcr_product_size AS ha_pcr_product_size,
	CASE
		WHEN lin_products.ha_pcr_product_size IS NOT NULL AND amp_products.amp_product_size IS NOT NULL
	 	THEN lin_products.ha_pcr_product_size - amp_products.amp_product_size + 2649
	 	ELSE NULL
	END AS lin_product_size,
	CASE
		WHEN lin_products.ha_pcr_product_size IS NOT NULL AND amp_products.amp_product_size IS NOT NULL
		AND amp_products.amp_product_size IS NOT NULL AND snv_lib_gibson_products.lin_product_vector_amount IS NOT NULL
		AND amp_products.amp_product_size - lin_products.ha_pcr_product_size != 2649
		THEN 7.0 * amp_products.amp_product_size / (lin_products.ha_pcr_product_size - amp_products.amp_product_size + 2649) * snv_lib_gibson_products.lin_product_vector_amount
		ELSE NULL
	END AS amp_product_vector_amount
FROM ${snvLibGibsonProducts}
JOIN ${snvLibCloningExperiments} ON ${snvLibCloningExperiments.id} = ${snvLibGibsonProducts.snvLibCloningExperimentId}
LEFT JOIN
	(SELECT ${snvLibLinProducts.id} AS id,
		${snvLibLinProducts.name} AS name,
		${snvLibLinProducts.snvLibCloningExperimentId} AS snv_lib_cloning_experiment_id,
		${snvLibLinProducts.quant} AS quant,
		CASE
			 WHEN ${haPcrProducts.startPosition} IS NOT NULL AND ${haPcrProducts.stopPosition} IS NOT NULL
			 THEN
			 	${haPcrProducts.stopPosition} - ${haPcrProducts.startPosition} + 1
			 ELSE NULL
		END AS ha_pcr_product_size
		FROM ${snvLibLinProducts}
			LEFT JOIN ${haPuc19Plasmids} ON ${haPuc19Plasmids.id} = ${snvLibLinProducts.haPuc19PlasmidId}
			LEFT JOIN ${haPuc19GibsonProducts} ON ${haPuc19Plasmids.haPuc19GibsonProductId} = ${haPuc19GibsonProducts.id}
			LEFT JOIN ${haPuc19PcrProducts} ON ${haPuc19GibsonProducts.haPuc19PcrProductId} = ${haPuc19PcrProducts.id}
			LEFT JOIN ${haPcrProducts} ON ${haPuc19PcrProducts.haPcrProductId} = ${haPcrProducts.id}
	) lin_products ON lin_products.snv_lib_cloning_experiment_id = ${snvLibGibsonProducts.snvLibCloningExperimentId}
LEFT JOIN (
	SELECT
        ${snvLibAmpProducts.id} AS id,
		${snvLibAmpProducts.name} AS name,
		${snvLibAmpProducts.snvLibCloningExperimentId} AS snv_lib_cloning_experiment_id,
		${snvLibAmpProducts.quant} AS quant,
		CASE
			 WHEN ${snvLibAmpProducts.startPosition} IS NOT NULL AND ${snvLibAmpProducts.stopPosition} IS NOT NULL
			 THEN ${snvLibAmpProducts.stopPosition} - ${snvLibAmpProducts.startPosition} + 1
			 ELSE NULL
		END AS amp_product_size
	FROM ${snvLibAmpProducts}
    ) amp_products ON amp_products.snv_lib_cloning_experiment_id = ${snvLibGibsonProducts.snvLibCloningExperimentId}
) t2 ) t3`)
