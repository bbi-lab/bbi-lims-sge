import { pgTable, PgTableWithColumns, uuid, varchar } from 'drizzle-orm/pg-core'
import _ from 'lodash'
import {projects} from './project'
import {genes} from './gene'

export const targets: PgTableWithColumns<any> = pgTable('targets', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  projectId: uuid('project_id').references(() => projects.id),
  geneId: uuid('gene_id').references(() => genes.id),
})
