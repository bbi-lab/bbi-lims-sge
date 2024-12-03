import { pgTable, PgTableWithColumns, timestamp, uuid, boolean, varchar, doublePrecision } from 'drizzle-orm/pg-core'
import { users } from '../user'
import { transfectTargets } from './transfect-experiment'

export const pellets: PgTableWithColumns<any> = pgTable('pellets', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  transfectTargetId: uuid('transfect_target_id').references(() => transfectTargets.id).notNull(),
  harvestedOn: timestamp('harvested_on'),
  harvestedBy: uuid('harvested_by').references(() => users.id),
  isCurrent: boolean('is_current'),
  isBackup: boolean('is_backup'),
  quant: doublePrecision('quant'),
  storageBoxId: uuid('storage_box_id'),
  storageBoxLoc: varchar('storage_box_loc'),
})
