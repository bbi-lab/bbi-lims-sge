DROP VIEW "public"."view_sequencing_run_all_samples";--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" DROP CONSTRAINT "sequencing_run_samples_nucleic_acid_id_nucleic_acids_id_fk";
--> statement-breakpoint
ALTER TABLE "external_samples" ALTER COLUMN "custom_index_seq_1" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ADD COLUMN "dna_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ADD CONSTRAINT "sequencing_run_samples_dna_id_dna_id_fk" FOREIGN KEY ("dna_id") REFERENCES "public"."dna"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" DROP COLUMN "nucleic_acid_id";--> statement-breakpoint
CREATE VIEW "public"."view_sequencing_run_all_samples" AS (SELECT
  sequencing_run_samples.id AS id,
  pellets.name AS sample_name,
  sequencing_run_id,
  'internal' AS sample_type,
  dna_id,
  NULL AS external_sample_id,
  index_primer_1_id,
  index_primer_2_id,
  primer1.index_sequence || ' (' || primer1.primer_type || ')' AS index_primer_1_label,
  primer2.index_sequence || ' (' || primer2.primer_type || ')' AS index_primer_2_label,
  source_well_id,
  wells.x AS source_well_x,
  wells.y AS source_well_y,
  plates.name AS source_plate_name,
  NULL AS custom_index_seq_1,
  NULL AS custom_index_seq_2,
  million_reads_required,
  CASE
    WHEN index_primer_1_id IS NOT NULL AND index_primer_2_id IS NOT NULL THEN 'Y151;I10;I10;Y151'
    WHEN index_primer_1_id IS NOT NULL AND index_primer_2_id IS NULL THEN 'Y151;I10;N10;Y151'
    WHEN index_primer_1_id IS NULL AND index_primer_2_id IS NOT NULL THEN 'Y151;N10;I10;Y151'
  ELSE
    NULL
  END AS override_cycles,
  sequencing_run_samples.notes AS notes,
  created_at
  FROM sequencing_run_samples
  JOIN dna ON sequencing_run_samples.dna_id = dna.id
  JOIN pellets ON dna.pellet_id = pellets.id
  JOIN index_primers AS primer1 ON sequencing_run_samples.index_primer_1_id = primer1.id
  JOIN index_primers AS primer2 ON sequencing_run_samples.index_primer_2_id = primer2.id
  JOIN wells ON sequencing_run_samples.source_well_id = wells.id
  JOIN plates ON wells.plate_id = plates.id
  UNION
  SELECT
  sequencing_run_external_samples.id AS id,
  external_samples.name AS sample_name,
  sequencing_run_id,
  'external' AS sample_type,
  NULL AS dna_id,
  external_sample_id,
  index_primer_1_id,
  index_primer_2_id,
  primer1.index_sequence || ' (' || primer1.primer_type || ')' AS index_primer_1_label,
  primer2.index_sequence || ' (' || primer2.primer_type || ')' AS index_primer_2_label,
  source_well_id,
  wells.x AS source_well_x,
  wells.y AS source_well_y,
  plates.name AS source_plate_name,
  sequencing_run_external_samples.custom_index_seq_1 as custom_index_seq_1,
  sequencing_run_external_samples.custom_index_seq_2 as custom_index_seq_2,
  million_reads_required,
  CASE
    WHEN (index_primer_1_id != NULL AND index_primer_2_id != NULL) OR (COALESCE(TRIM(sequencing_run_external_samples.custom_index_seq_1), '') <> '' AND COALESCE(TRIM(sequencing_run_external_samples.custom_index_seq_2), '') <> '') THEN 'Y151;I10;I10;Y151'
    WHEN (index_primer_1_id != NULL AND index_primer_2_id = NULL) OR (COALESCE(TRIM(sequencing_run_external_samples.custom_index_seq_1), '') <> '' AND COALESCE(TRIM(sequencing_run_external_samples.custom_index_seq_2), '') = '') THEN 'Y151;I10;N10;Y151'
    WHEN (index_primer_1_id = NULL AND index_primer_2_id != NULL) OR (COALESCE(TRIM(sequencing_run_external_samples.custom_index_seq_1), '') = '' AND COALESCE(TRIM(sequencing_run_external_samples.custom_index_seq_2), '') <> '') THEN 'Y151;N10;I10;Y151'
  ELSE
    NULL
  END AS override_cycles,
  notes,
  sequencing_run_external_samples.created_at AS created_at
  FROM sequencing_run_external_samples
  JOIN external_samples ON sequencing_run_external_samples.external_sample_id = external_samples.id
  LEFT JOIN index_primers AS primer1 ON sequencing_run_external_samples.index_primer_1_id = primer1.id
  LEFT JOIN index_primers AS primer2 ON sequencing_run_external_samples.index_primer_2_id = primer2.id
  LEFT JOIN wells ON sequencing_run_external_samples.source_well_id = wells.id
  LEFT JOIN plates ON wells.plate_id = plates.id);