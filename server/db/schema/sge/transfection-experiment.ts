import { type InferSelectModel } from 'drizzle-orm'
import { pgTable, PgTableWithColumns, timestamp, uuid, varchar, primaryKey } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { users } from '../user'
import { targets } from './target'
import { dateSchema } from '../../helpers/schemas'

export const transfectionExperiments: PgTableWithColumns<any> = pgTable('transfection_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow(),
})

export const transfectionExperimentsTargets: PgTableWithColumns<any> = pgTable('transfection_experiments_targets', {
  transfectionExperimentId: uuid('transfection_experiment_id').references(() => transfectionExperiments.id),
  targetId: uuid('target_id').references(() => targets.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.transfectionExperimentId, t.targetId] }),
}))

const selectTransfectionExperimentSchema = createSelectSchema(transfectionExperiments)
const updateTransfectionExperimentSchema = createSelectSchema(transfectionExperiments, {startedOn: dateSchema}).omit({id: true})
const insertTransfectionExperimentSchema = updateTransfectionExperimentSchema

export const schemas: Record<string, ZodObject<any>> = {
    selectTransfectionExperimentSchema,
    updateTransfectionExperimentSchema,
    insertTransfectionExperimentSchema
}

export type TransfectionExperiment = InferSelectModel<typeof transfectionExperiments>
export type NewTransfectionExperiment = z.infer<typeof insertTransfectionExperimentSchema>
export type UpdateTransfectionExperiment = z.infer<typeof updateTransfectionExperimentSchema>
