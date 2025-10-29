CREATE TABLE "external_samples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "external_samples_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DROP VIEW "public"."view_sequencing_run_all_samples";--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "one_item_per_well_content";--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_sequencing_run_external_sample_id_sequencing_run_external_samples_id_fk";
--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ALTER COLUMN "sequencing_run_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ALTER COLUMN "external_sample_id" SET DATA TYPE uuid USING "external_sample_id"::uuid;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ALTER COLUMN "sequencing_run_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "well_contents" ADD COLUMN "external_sample_id" uuid;--> statement-breakpoint
ALTER TABLE "external_samples" ADD CONSTRAINT "external_samples_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ADD CONSTRAINT "sequencing_run_external_samples_external_sample_id_external_samples_id_fk" FOREIGN KEY ("external_sample_id") REFERENCES "public"."external_samples"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_external_sample_id_external_samples_id_fk" FOREIGN KEY ("external_sample_id") REFERENCES "public"."external_samples"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "sequencing_run_external_sample_id";--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "one_item_per_well_content" CHECK (num_nonnulls("well_contents"."amplification_primer_id", "well_contents"."linearization_primer_id", "well_contents"."homology_arm_primer_id", "well_contents"."preseq_1_primer_id", "well_contents"."preseq_2_primer_id", "well_contents"."index_primer_id", "well_contents"."nucleic_acid_id", "well_contents"."pellet_id", "well_contents"."sg_rna_plasmid_id", "well_contents"."snv_lib_plasmid_id", "well_contents"."sg_rna_oligo_id", "well_contents"."external_sample_id") = 1);--> statement-breakpoint
CREATE VIEW "public"."view_sequencing_run_all_samples" AS (SELECT
  sequencing_run_samples.id AS id,
  pellets.name AS sample_name,
  sequencing_run_id,
  'internal' AS sample_type,
  nucleic_acid_id,
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
  JOIN nucleic_acids ON sequencing_run_samples.nucleic_acid_id = nucleic_acids.id
  JOIN pellets ON nucleic_acids.pellet_id = pellets.id
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
  NULL AS nucleic_acid_id,
  external_sample_id,
  index_primer_1_id,
  index_primer_2_id,
  primer1.index_sequence || ' (' || primer1.primer_type || ')' AS index_primer_1_label,
  primer2.index_sequence || ' (' || primer2.primer_type || ')' AS index_primer_2_label,
  source_well_id,
  wells.x AS source_well_x,
  wells.y AS source_well_y,
  plates.name AS source_plate_name,
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
  sequencing_run_external_samples.created_at AS created_at
  FROM sequencing_run_external_samples
  JOIN external_samples ON sequencing_run_external_samples.external_sample_id = external_samples.id
  LEFT JOIN index_primers AS primer1 ON sequencing_run_external_samples.index_primer_1_id = primer1.id
  LEFT JOIN index_primers AS primer2 ON sequencing_run_external_samples.index_primer_2_id = primer2.id
  LEFT JOIN wells ON sequencing_run_external_samples.source_well_id = wells.id
  LEFT JOIN plates ON wells.plate_id = plates.id);
