import { pgTable, timestamp, uuid, varchar, uniqueIndex, integer } from "drizzle-orm/pg-core";
import { wells } from "./well";
import { nucleicAcids } from "./nucleic-acid";
import { indexPrimers } from "./primer";
import { sql } from "drizzle-orm";

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
}, (t) => [
  uniqueIndex('unique_index_primers_per_sequencing_run').on(t.sequencingRunId, sql`least(${t.indexPrimer1Id}, ${t.indexPrimer2Id})`, sql`greatest(${t.indexPrimer1Id}, ${t.indexPrimer2Id})`),
])

export const sequencingRunExternalSamples = pgTable('sequencing_run_external_samples', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  sequencingRunId: uuid('sequencing_run_id').references(() => sequencingRuns.id).notNull(),
  externalSampleId: varchar('external_sample_id', { length: 255 }).notNull(),
  customIndexSeq1: varchar('custom_index_seq_1', { length: 50 }).notNull(),
  customIndexSeq2: varchar('custom_index_seq_2', { length: 50 }).notNull(),
  millionReadsRequired: integer('million_reads_required'),
  overrideCycles: varchar('override_cycles', { length: 10 }).array(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  uniqueIndex('unique_custom_index_seqs_per_sequencing_run').on(t.sequencingRunId, sql`least(${t.customIndexSeq1}, ${t.customIndexSeq2})`, sql`greatest(${t.customIndexSeq1}, ${t.customIndexSeq2})`),
])
