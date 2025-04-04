import { pgTable, unique, uuid, varchar } from 'drizzle-orm/pg-core'

export const storageBoxes = pgTable('storage_boxes', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  location: varchar('location', { length: 255 }),
})
