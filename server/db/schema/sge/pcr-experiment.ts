import { pgTable, timestamp, uuid, varchar, smallint, unique } from 'drizzle-orm/pg-core'
import _ from 'lodash'
import { users } from '../user'

export const pcrExperiments = pgTable('pcr_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  pcrType: varchar('pcr_type', {enum: ['AMP', 'LIN', 'HA', '1', '2', '3']}).notNull(),
  round: smallint('round'),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow(),
})
