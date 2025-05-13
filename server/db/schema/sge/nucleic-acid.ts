import { pgTable, uuid, varchar, text, doublePrecision } from 'drizzle-orm/pg-core'
import { extractionExperiments } from './extraction-experiment'
import { pellets } from './pellet'
import { InferSelectModel } from 'drizzle-orm'

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
