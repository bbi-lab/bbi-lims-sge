import { type InferSelectModel } from 'drizzle-orm'
import { pgTable, PgTableWithColumns, timestamp, uuid, varchar, primaryKey } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { users } from '../user'
import { targets } from './target'
import { dateSchema } from '../../helpers/schemas'

export const transfectExperiments: PgTableWithColumns<any> = pgTable('transfect_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow(),
})

export const transfectTargets: PgTableWithColumns<any> = pgTable('transfect_targets', {
  experimentId: uuid('experiment_id').references(() => transfectExperiments.id).notNull(),
  targetId: uuid('target_id').references(() => targets.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.experimentId, t.targetId] }),
}))
