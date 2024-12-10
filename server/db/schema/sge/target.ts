import { pgTable, PgTableWithColumns, uuid, varchar } from 'drizzle-orm/pg-core'
import _ from 'lodash'
import {projects} from './project'
import {regions} from './region'
import {cycles} from './cycle'

export const targets = pgTable('targets', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  projectId: uuid('project_id').references(() => projects.id),
  cycleId: uuid('cycle_id').references(() => cycles.id),
  regionId: uuid('region_id').references(() => regions.id).notNull(),
})
