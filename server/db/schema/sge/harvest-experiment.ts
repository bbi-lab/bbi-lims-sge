import { type InferSelectModel } from 'drizzle-orm'
import { pgTable, PgTableWithColumns, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { users } from '../user'
import { dateSchema } from '../../helpers/schemas'

export const harvestExperiments: PgTableWithColumns<any> = pgTable('harvest_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow(),
})

const selectHarvestExperimentSchema = createSelectSchema(harvestExperiments)
const updateHarvestExperimentSchema = createSelectSchema(harvestExperiments, {startedOn: dateSchema}).omit({id: true})
const insertHarvestExperimentSchema = updateHarvestExperimentSchema

export const schemas: Record<string, ZodObject<any>> = {
    selectHarvestExperimentSchema,
    updateHarvestExperimentSchema,
    insertHarvestExperimentSchema
}

export type HarvestExperiment = InferSelectModel<typeof harvestExperiments>
export type NewHarvestExperiment = z.infer<typeof insertHarvestExperimentSchema>
export type UpdateHarvestExperiment = z.infer<typeof updateHarvestExperimentSchema>
