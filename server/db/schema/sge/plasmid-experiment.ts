import { type InferSelectModel } from 'drizzle-orm'
import { pgTable, PgTableWithColumns, timestamp, uuid, varchar, decimal } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { users } from '../user'
import { dateSchema } from '../../helpers/schemas'

export const plasmidExperiments: PgTableWithColumns<any> = pgTable('plasmid_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow(),
  temperature: decimal('temperature'),
})

const selectPlasmidExperimentSchema = createSelectSchema(plasmidExperiments)
const updatePlasmidExperimentSchema = createSelectSchema(plasmidExperiments, {startedOn: dateSchema}).omit({id: true})
const insertPlasmidExperimentSchema = updatePlasmidExperimentSchema

export const schemas: Record<string, ZodObject<any>> = {
    selectPlasmidExperimentSchema,
    updatePlasmidExperimentSchema,
    insertPlasmidExperimentSchema
}

export type PlasmidExperiment = InferSelectModel<typeof plasmidExperiments>
export type NewPlasmidExperiment = z.infer<typeof insertPlasmidExperimentSchema>
export type UpdatePlasmidExperiment = z.infer<typeof updatePlasmidExperimentSchema>
