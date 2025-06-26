import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { wells } from "./well";
import { nucleicAcids } from "./nucleic-acid";
import { indexPrimers } from "./primer";

export const sequencingRuns = pgTable('sequencing_runs', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  status: varchar('status', { enum: ['pending', 'running', 'completed', 'canceled', 'failed'] }).default('pending'),
  createdOn: timestamp('created_on'),
  startedOn: timestamp('started_on'),
  endedOn: timestamp('ended_on'),
})

export const sequencingRunSamples = pgTable('sequencing_run_samples', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  sequencingRunId: uuid('sequencing_run_id').references(() => sequencingRuns.id).notNull(),
  nucleicAcidId: uuid('nucleic_acid_id').references(() => nucleicAcids.id).notNull(),
  indexPrimer1Id: uuid('index_primer_1_id').references(() => indexPrimers.id).notNull(),
  indexPrimer2Id: uuid('index_primer_2_id').references(() => indexPrimers.id).notNull(),
  sourceWellId: uuid('source_well_id').references(() => wells.id),
  createdAt: timestamp('created_at').defaultNow(),
})
