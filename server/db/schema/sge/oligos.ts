import { sql } from 'drizzle-orm/sql'
import { pgTable, uuid, varchar, text, check, integer, timestamp, doublePrecision, boolean} from 'drizzle-orm/pg-core'
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
    totalReactionVolume: doublePrecision('total_reaction_volume').default(10),
    notes: text('notes'),
})

export const snvLibAmpProducts = pgTable('snv_lib_amp_products', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    snvLibCloningExperimentId: uuid('snv_lib_cloning_experiment_id').references(() => snvLibCloningExperiments.id).notNull().unique(),
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
    snvLibCloningExperimentId: uuid('snv_lib_cloning_experiment_id').references(() => snvLibCloningExperiments.id).notNull().unique(),
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
    snvLibCloningExperimentId: uuid('snv_lib_cloning_experiment_id').references(() => snvLibCloningExperiments.id).notNull().unique(),
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
    totalReactionVolume: doublePrecision('total_reaction_volume').default(10),
    notes: text('notes'),
}, (table) => [
  check("benchling_link_check", sql`${table.benchlingLink} ~* '^https?://.+$'`),
])

export const snvLibClonalDnaProducts = pgTable('snv_lib_clonal_dna_products', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    snvLibCloningExperimentId: uuid('snv_lib_cloning_experiment_id').references(() => snvLibCloningExperiments.id).notNull().unique(),
    gelExtractedOn: timestamp('gel_extracted_on'),
    gelExtractedBy: uuid('gel_extracted_by').references(() => users.id),
    quant: doublePrecision('quant'),
    size: integer('size'),
    notes: text('notes'),
})

export const snvLibGoldenGateProducts = pgTable('snv_lib_golden_gate_products', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    snvLibCloningExperimentId: uuid('snv_lib_cloning_experiment_id').references(() => snvLibCloningExperiments.id).notNull().unique(),
    snvLibAmpProductId: uuid('snv_lib_amp_product_id').references(() => snvLibAmpProducts.id).notNull().unique(),
    snvLibClonalDnaProductId: uuid('snv_lib_clonal_dna_product_id').references(() => snvLibClonalDnaProducts.id).notNull().unique(),
    goldenGateProductVectorAmount: doublePrecision('golden_gate_product_vector_amount').default(50),
    notes: text('notes'),
})
