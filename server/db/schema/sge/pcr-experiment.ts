import { type InferSelectModel, relations } from 'drizzle-orm'
import { boolean, pgEnum, pgTable, PgTableWithColumns, AnyPgColumn, text, timestamp, date, uuid, varchar, smallint } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { users } from '../user'
import { dateSchema } from '../../helpers/schemas'

export const pcrExperiments: PgTableWithColumns<any> = pgTable('pcr_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  round: smallint('round'),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow().notNull(),
})

const selectPcrExperimentSchema = createSelectSchema(pcrExperiments)

const updatePcrExperimentSchema = createSelectSchema(pcrExperiments, {startedOn: dateSchema}).omit({id: true})
const insertPcrExperimentSchema = updatePcrExperimentSchema

export const schemas: Record<string, ZodObject<any>> = {
    selectPcrExperimentSchema,
    updatePcrExperimentSchema,
    insertPcrExperimentSchema
}

export type PcrExperiment = InferSelectModel<typeof pcrExperiments>
export type NewPcrExperiment = z.infer<typeof insertPcrExperimentSchema>
export type UpdatePcrExperiment = z.infer<typeof updatePcrExperimentSchema>
