import { pgTable, PgTableWithColumns, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'
import _ from 'lodash'

export const cycles: PgTableWithColumns<any> = pgTable('cycles', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  startedOn: timestamp('started_on').defaultNow(),
  endedOn: timestamp('ended_on'),
})
