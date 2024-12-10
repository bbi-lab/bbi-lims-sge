import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import _ from 'lodash'
import { users } from '../user'

export const extractionExperiments = pgTable('extraction_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  extractedOn: timestamp('extractedOn').defaultNow(),
})
