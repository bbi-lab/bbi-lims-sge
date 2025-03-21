import { pgTable, timestamp, uuid, varchar, decimal } from 'drizzle-orm/pg-core'
import _ from 'lodash'
import { users } from '../user'

export const plasmidExperiments = pgTable('plasmid_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow(),
  temperature: decimal('temperature'),
})
