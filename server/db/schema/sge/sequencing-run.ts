import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const sequencingRuns = pgTable('sequencing_runs', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  status: varchar('status', { enum: ['pending', 'running', 'completed', 'canceled', 'failed'] }).default('pending'),
  createdOn: timestamp('created_on'),
  startedOn: timestamp('started_on'),
  endedOn: timestamp('ended_on'),
})
