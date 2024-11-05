import { pgTable, PgTableWithColumns, uuid, varchar, integer } from 'drizzle-orm/pg-core'
import _ from 'lodash'

export const genes: PgTableWithColumns<any> = pgTable('genes', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  hgnc_id: integer('hgnc_id'),
  symbol: varchar('symbol', { length: 20 }),
  name: varchar('name', { length: 255 }),
})
