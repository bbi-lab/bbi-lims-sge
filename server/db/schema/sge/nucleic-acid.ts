import { pgTable, uuid, varchar, text, doublePrecision } from 'drizzle-orm/pg-core'
import { storageBoxes } from './storage-box'
import { extractionExperiments } from './extraction-experiment'
import { pellets } from './pellet'

export const nucleicAcids = pgTable('nucleic_acids', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  extractionExperimentId: uuid('extraction_experiment_id').references(() => extractionExperiments.id),
  storageBoxId: uuid('storage_box_id').references(() => storageBoxes.id),
  storageBoxLoc: varchar('storage_box_loc'),
  concentration: doublePrecision('concentration'),
  pelletId: uuid('pellet_id').references(() => pellets.id),
  notes: text('notes'),
})
