import { pgTable, timestamp, uuid, varchar, uniqueIndex, pgView, doublePrecision, text } from "drizzle-orm/pg-core";
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
  millionReadsRequired: doublePrecision('million_reads_required'),
  notes: text('notes'),
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
  millionReadsRequired: doublePrecision('million_reads_required'),
  overrideCycles: varchar('override_cycles', { length: 10 }).array(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  uniqueIndex('unique_custom_index_seqs_per_sequencing_run').on(t.sequencingRunId, sql`least(${t.customIndexSeq1}, ${t.customIndexSeq2})`, sql`greatest(${t.customIndexSeq1}, ${t.customIndexSeq2})`),
])

export const viewSequencingRunAllSamples = pgView('view_sequencing_run_all_samples', {
  id: uuid('id'),
  sampleName: varchar('sample_name'),
  sequencingRunId: uuid('sequencing_run_id'),
  sampleType: varchar('sample_type', { enum: ['internal', 'external'] }),
  nucleicAcidId: uuid('nucleic_acid_id'),
  indexPrimer1Id: uuid('index_primer_1_id'),
  indexPrimer2Id: uuid('index_primer_2_id'),
  sourceWellId: uuid('source_well_id'),
  externalSampleId: varchar('external_sample_id'),
  customIndexSeq1: varchar('custom_index_seq_1'),
  customIndexSeq2: varchar('custom_index_seq_2'),
  millionReadsRequired: doublePrecision('million_reads_required'),
  overrideCycles: varchar('override_cycles').array(),
  notes: text('notes'),
  createdAt: timestamp('created_at'),
}).as(sql`SELECT
  sequencing_run_samples.id AS id,
  pellets.name AS sample_name,
  sequencing_run_id,
  'internal' AS sample_type,
  nucleic_acid_id,
  index_primer_1_id,
  index_primer_2_id,
  source_well_id,
  NULL AS custom_index_seq_1,
  NULL AS custom_index_seq_2,
  million_reads_required,
  NULL AS override_cycles,
  sequencing_run_samples.notes AS notes,
  created_at
  FROM sequencing_run_samples
  JOIN nucleic_acids ON sequencing_run_samples.nucleic_acid_id = nucleic_acids.id
  JOIN pellets ON nucleic_acids.pellet_id = pellets.id
  JOIN index_primers AS primer1 ON sequencing_run_samples.index_primer_1_id = primer1.id
  JOIN index_primers AS primer2 ON sequencing_run_samples.index_primer_2_id = primer2.id
  UNION
  SELECT
  id,
  external_sample_id as sample_name,
  sequencing_run_id,
  'external' AS sample_type,
  NULL AS nucleic_acid_id,
  NULL AS index_primer_1_id,
  NULL AS index_primer_2_id,
  NULL AS source_well_id,
  custom_index_seq_1,
  custom_index_seq_2,
  million_reads_required,
  override_cycles,
  notes,
  created_at
  FROM sequencing_run_external_samples`)
