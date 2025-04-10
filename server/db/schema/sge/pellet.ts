import { pgTable, timestamp, uuid, boolean, varchar, text, integer, doublePrecision } from 'drizzle-orm/pg-core'
import { users } from '../user'
import { transfectTargets } from './transfect-experiment'
import { storageBoxes } from './storage-box'
export const VALID_PROTOCOLS = ['AllPrep', 'DNeasy']

export const pellets = pgTable('pellets', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
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
  dnaConcentration: doublePrecision('dna_concentration'),
  dnaVolume: doublePrecision('dna_volume'),
  dnaYield: doublePrecision('dna_yield'),
  rnaConcentration: doublePrecision('rna_concentration'),
  rnaVolume: doublePrecision('rna_volume'),
  rnaYield: doublePrecision('rna_yield'),
  pctPassaged: doublePrecision('pct_passaged'),
  pctHarvested: doublePrecision('pct_harvested'),
  protocol: varchar('protocol', {enum: VALID_PROTOCOLS as [string, ...string[]]}),
  notes: text('notes'),
})
