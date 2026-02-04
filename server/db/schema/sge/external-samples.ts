import { check, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { users } from "../user"
import { sql } from "drizzle-orm/sql"

export const externalSamples = pgTable('external_samples', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name').notNull().unique(),
  description: text('description'),
  customIndexSeq1: varchar('custom_index_seq_1', { length: 50 }).notNull(),
  customIndexSeq2: varchar('custom_index_seq_2', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
})
