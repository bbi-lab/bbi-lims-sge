import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "../user";

export const externalSamples = pgTable('external_samples', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
});
