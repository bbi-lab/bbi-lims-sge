import { pgTable, PgTableWithColumns, uuid, varchar } from 'drizzle-orm/pg-core'

export const storageBoxes = pgTable('storage_boxes', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
})
