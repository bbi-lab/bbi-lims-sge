import { pgTable, timestamp, uuid, varchar, smallint, unique } from 'drizzle-orm/pg-core'
import _ from 'lodash'
import { users } from '../user'
import { ENUM_LOOKUPS } from './enum-lookups'
import { transfectTargets } from './transfect-experiment'

export type PcrType = 'amp-pcr' | 'lin-pcr' | 'ha-pcr' | 'preseq-1' | 'preseq-2' | 'preseq-3'

export const pcrExperiments = pgTable('pcr_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  pcrType: varchar('pcr_type', { enum: Object.keys(ENUM_LOOKUPS.pcrExperiments.pcrType) as [PcrType, ...PcrType[]] }).notNull(),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow(),
  transfectTargetId: uuid('transfect_target_id').references(() => transfectTargets.id),
})
