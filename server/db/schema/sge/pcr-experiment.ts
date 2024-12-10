import { type InferSelectModel } from 'drizzle-orm'
import { pgTable, PgTableWithColumns, timestamp, uuid, varchar, smallint } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { users } from '../user'
import { dateSchema } from '../../helpers/schemas'

export const pcrExperiments = pgTable('pcr_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  round: smallint('round'),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow(),
})
