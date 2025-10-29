DROP VIEW "public"."view_sequencing_run_all_samples";--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ALTER COLUMN "million_reads_required" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ALTER COLUMN "million_reads_required" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ADD COLUMN "index_primer_1_id" uuid;--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ADD COLUMN "index_primer_2_id" uuid;--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ADD COLUMN "source_well_id" uuid;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ADD COLUMN "project_name" varchar(255);--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ADD CONSTRAINT "sequencing_run_external_samples_index_primer_1_id_index_primers_id_fk" FOREIGN KEY ("index_primer_1_id") REFERENCES "public"."index_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ADD CONSTRAINT "sequencing_run_external_samples_index_primer_2_id_index_primers_id_fk" FOREIGN KEY ("index_primer_2_id") REFERENCES "public"."index_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ADD CONSTRAINT "sequencing_run_external_samples_source_well_id_wells_id_fk" FOREIGN KEY ("source_well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" DROP COLUMN "override_cycles";--> statement-breakpoint
CREATE VIEW "public"."view_sequencing_run_all_samples" AS (SELECT
  sequencing_run_samples.id AS id,
  pellets.name AS sample_name,
  sequencing_run_id,
  'internal' AS sample_type,
  nucleic_acid_id,
  index_primer_1_id,
  index_primer_2_id,
  primer1.index_sequence || ' (' || primer1.primer_type || ')' as index_primer_1_label,
  primer2.index_sequence || ' (' || primer2.primer_type || ')' as index_primer_2_label,
  source_well_id,
  wells.x as source_well_x,
  wells.y as source_well_y,
  plates.name as source_plate_name,
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
  JOIN nucleic_acids ON sequencing_run_samples.nucleic_acid_id = nucleic_acids.id
  JOIN pellets ON nucleic_acids.pellet_id = pellets.id
  JOIN index_primers AS primer1 ON sequencing_run_samples.index_primer_1_id = primer1.id
  JOIN index_primers AS primer2 ON sequencing_run_samples.index_primer_2_id = primer2.id
  JOIN wells ON sequencing_run_samples.source_well_id = wells.id
  JOIN plates ON wells.plate_id = plates.id
  UNION
  SELECT
  sequencing_run_external_samples.id as id,
  external_sample_id as sample_name,
  sequencing_run_id,
  'external' AS sample_type,
  NULL AS nucleic_acid_id,
  index_primer_1_id,
  index_primer_2_id,
  primer1.index_sequence || ' (' || primer1.primer_type || ')' as index_primer_1_label,
  primer2.index_sequence || ' (' || primer2.primer_type || ')' as index_primer_2_label,
  source_well_id,
  wells.x as source_well_x,
  wells.y as source_well_y,
  plates.name as source_plate_name,
  custom_index_seq_1,
  custom_index_seq_2,
  million_reads_required,
  CASE
    WHEN (index_primer_1_id != NULL AND index_primer_2_id != NULL) OR (COALESCE(TRIM(custom_index_seq_1), '') <> '' AND COALESCE(TRIM(custom_index_seq_2), '') <> '') THEN 'Y151;I10;I10;Y151'
    WHEN (index_primer_1_id != NULL AND index_primer_2_id = NULL) OR (COALESCE(TRIM(custom_index_seq_1), '') <> '' AND COALESCE(TRIM(custom_index_seq_2), '') = '') THEN 'Y151;I10;N10;Y151'
    WHEN (index_primer_1_id = NULL AND index_primer_2_id != NULL) OR (COALESCE(TRIM(custom_index_seq_1), '') = '' AND COALESCE(TRIM(custom_index_seq_2), '') <> '') THEN 'Y151;N10;I10;Y151'
  ELSE
    NULL
  END AS override_cycles,
  notes,
  created_at
  FROM sequencing_run_external_samples
  LEFT JOIN index_primers AS primer1 ON sequencing_run_external_samples.index_primer_1_id = primer1.id
  LEFT JOIN index_primers AS primer2 ON sequencing_run_external_samples.index_primer_2_id = primer2.id
  LEFT JOIN wells ON sequencing_run_external_samples.source_well_id = wells.id
  LEFT JOIN plates ON wells.plate_id = plates.id);