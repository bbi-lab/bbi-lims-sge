import { type InferSelectModel } from 'drizzle-orm'
import { pgTable, PgTableWithColumns, timestamp, uuid, varchar, decimal } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { users } from '../user'
import { dateSchema } from '../../helpers/schemas'

export const plasmidExperiments = pgTable('plasmid_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow(),
  temperature: decimal('temperature'),
})
