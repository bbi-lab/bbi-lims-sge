import { type InferSelectModel, relations } from 'drizzle-orm'
import { boolean, pgEnum, pgTable, PgTableWithColumns, AnyPgColumn, text, timestamp, date, uuid, varchar, smallint } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { users } from '../../schema/user'

export const pcrExperiments: PgTableWithColumns<any> = pgTable('pcr_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  round: smallint('round'),
  technician: uuid('technician').references(() => users.id),
  started_on: timestamp('started_on').defaultNow().notNull(),
})

const selectPcrExperimentSchema = createSelectSchema(pcrExperiments)

export const schemas: Record<string, ZodObject<any>> = {
    selectPcrExperimentSchema,
}

export type PcrExperiment = InferSelectModel<typeof pcrExperiments>
