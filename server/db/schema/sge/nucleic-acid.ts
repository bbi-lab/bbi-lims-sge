import { pgTable, uuid, varchar, text, doublePrecision } from 'drizzle-orm/pg-core'
import { extractionExperiments } from './extraction-experiment'
import { pellets } from './pellet'
import { type InferSelectModel } from 'drizzle-orm/table'

export const VALID_PROTOCOLS = ['AllPrep', 'DNeasy']

export const nucleicAcids = pgTable('nucleic_acids', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  extractionExperimentId: uuid('extraction_experiment_id').references(() => extractionExperiments.id),
  pelletId: uuid('pellet_id').references(() => pellets.id).unique(),
  dnaConcentration: doublePrecision('dna_concentration'),
  dnaVolume: doublePrecision('dna_volume'),
  dnaYield: doublePrecision('dna_yield'),
  rnaConcentration: doublePrecision('rna_concentration'),
  rnaVolume: doublePrecision('rna_volume'),
  rnaYield: doublePrecision('rna_yield'),
  protocol: varchar('protocol', {enum: VALID_PROTOCOLS as [string, ...string[]]}),
  notes: text('notes'),
})

export type NucleicAcid = InferSelectModel<typeof nucleicAcids>

export const RNA_PROTOCOLS = ['AllPrep', 'RNeasy']

export const rna = pgTable('rna', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  extractionExperimentId: uuid('extraction_experiment_id').references(() => extractionExperiments.id),
  pelletId: uuid('pellet_id').references(() => pellets.id).unique(),
  concentration: doublePrecision('concentration'),
  volume: doublePrecision('volume'),
  yield: doublePrecision('yield'),
  protocol: varchar('protocol', {enum: RNA_PROTOCOLS as [string, ...string[]]}),
  notes: text('notes'),
})

export type Rna = InferSelectModel<typeof rna>

export const DNA_PROTOCOLS = ['AllPrep', 'DNeasy']

export const dna = pgTable('dna', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  extractionExperimentId: uuid('extraction_experiment_id').references(() => extractionExperiments.id),
  pelletId: uuid('pellet_id').references(() => pellets.id).unique(),
  concentration: doublePrecision('concentration'),
  volume: doublePrecision('volume'),
  yield: doublePrecision('yield'),
  protocol: varchar('protocol', {enum: DNA_PROTOCOLS as [string, ...string[]]}),
  notes: text('notes'),
})

export type Dna = InferSelectModel<typeof dna>
