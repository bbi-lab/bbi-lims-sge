import { pgTable, PgTableWithColumns, uuid, timestamp, varchar } from 'drizzle-orm/pg-core'
import _ from 'lodash'

export const projects: PgTableWithColumns<any> = pgTable('projects', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  startedOn: timestamp('started_on').defaultNow(),
})
