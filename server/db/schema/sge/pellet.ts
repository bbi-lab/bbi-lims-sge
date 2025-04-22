import { pgTable, timestamp, uuid, boolean, varchar, text, integer, doublePrecision } from 'drizzle-orm/pg-core'
import { users } from '../user'
import { transfectTargets } from './transfect-experiment'
import { extractionExperiments } from './extraction-experiment'
import { storageBoxes } from './storage-box'
import { InferSelectModel } from 'drizzle-orm'

export const pellets = pgTable('pellets', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).unique(),
  transfectTargetId: uuid('transfect_target_id').references(() => transfectTargets.id).notNull(),
  replicates: varchar('replicates', { length: 3 }).array(),
  harvestedOn: timestamp('harvested_on').notNull(),
  harvestDay: integer('harvest_day').notNull(),
  harvestedBy: uuid('harvested_by').references(() => users.id),
  isCurrent: boolean('is_current'),
  isBackup: boolean('is_backup'),
  quant: doublePrecision('quant'),
  storageBoxId: uuid('storage_box_id').references(() => storageBoxes.id),
  storageBoxLoc: varchar('storage_box_loc'),
  d3Confluency: doublePrecision('d3_confluency'),
  pctPassaged: doublePrecision('pct_passaged'),
  pctHarvested: doublePrecision('pct_harvested'),
  notes: text('notes'),
})

export type Pellet = InferSelectModel<typeof pellets>
