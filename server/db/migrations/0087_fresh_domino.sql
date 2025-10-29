ALTER TABLE "sequencing_run_external_samples" ALTER COLUMN "million_reads_required" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ADD COLUMN "million_reads_required" double precision;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ADD COLUMN "notes" text;--> statement-breakpoint
CREATE VIEW "public"."view_sequencing_run_all_samples" AS (SELECT
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
  FROM sequencing_run_external_samples);