import { pgTable, timestamp, unique, uuid, varchar, } from 'drizzle-orm/pg-core'
import { users } from '../user'
import { targets } from './target'

export const sgRnaCloningExperiments = pgTable('sg_rna_cloning_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  transformedOn: timestamp('transformed_on'),
})

export const snvLibCloningExperiments = pgTable('snv_lib_cloning_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  transformedOn: timestamp('transformed_on'),
})

export const haCloningExperiments = pgTable('ha_cloning_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  startedOn: timestamp('started_on').defaultNow(),
  endedOn: timestamp('ended_on'),
})

export const haCloningExperimentTargets = pgTable('ha_cloning_experiment_targets', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  haCloningExperimentId: uuid('ha_cloning_experiment_id').references(() => haCloningExperiments.id).notNull(),
  targetId: uuid('target_id').references(() => targets.id).notNull(),
}, (t) => [
  unique('unique_ha_cloning_experiment_target').on(t.haCloningExperimentId, t.targetId),
])
