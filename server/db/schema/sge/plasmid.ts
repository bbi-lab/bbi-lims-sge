import { pgTable, uuid, varchar, text, doublePrecision, check } from 'drizzle-orm/pg-core'
import { storageBoxes } from './storage-box'
import { plasmidExperiments } from './plasmid-experiment'
import { targets } from './target'
import { sql } from 'drizzle-orm'

export const plasmids = pgTable('plasmids', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  plasmidType: varchar('plasmid_type', {enum: ['guide', 'library', 'homology arm']}),
  volume: doublePrecision('volume'),
  quant: doublePrecision('quant'),
  targetId: uuid('target_id').references(() => targets.id).notNull(),
  plasmidExperimentId: uuid('plasmid_experiment_id').references(() => plasmidExperiments.id),
  // storageBoxId: uuid('storage_box_id').references(() => storageBoxes.id),
  // storageBoxLoc: varchar('storage_box_loc'),
  verificationStatus: varchar('verification_status', {enum: ['passed', 'failed']}),
  externalLink: text('external_link'),
  notes: text('notes'),
}, (table) => [
  check("external_link_check", sql`${table.externalLink} ~* '^https?://.+$'`),
])
