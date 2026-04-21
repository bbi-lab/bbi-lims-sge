DROP VIEW "public"."view_sequencing_run_all_samples";--> statement-breakpoint
ALTER TABLE "external_samples" ALTER COLUMN "custom_index_seq_1" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "external_samples" ADD COLUMN "index_primer_1_id" uuid;--> statement-breakpoint
ALTER TABLE "external_samples" ADD COLUMN "index_primer_2_id" uuid;--> statement-breakpoint
ALTER TABLE "external_samples" ADD CONSTRAINT "external_samples_index_primer_1_id_index_primers_id_fk" FOREIGN KEY ("index_primer_1_id") REFERENCES "public"."index_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_samples" ADD CONSTRAINT "external_samples_index_primer_2_id_index_primers_id_fk" FOREIGN KEY ("index_primer_2_id") REFERENCES "public"."index_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_index_primers_per_ext_sequencing_run" ON "sequencing_run_external_samples" USING btree ("sequencing_run_id",least("index_primer_1_id", "index_primer_2_id"),greatest("index_primer_1_id", "index_primer_2_id")) WHERE "sequencing_run_external_samples"."index_primer_1_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "external_samples" ADD CONSTRAINT "external_sample_index_check" CHECK (
    (COALESCE(TRIM("external_samples"."custom_index_seq_1"), '') <> '' AND "external_samples"."index_primer_1_id" IS NULL AND "external_samples"."index_primer_2_id" IS NULL)
    OR
    ("external_samples"."index_primer_1_id" IS NOT NULL AND COALESCE(TRIM("external_samples"."custom_index_seq_1"), '') = '' AND COALESCE(TRIM("external_samples"."custom_index_seq_2"), '') = '')
  );--> statement-breakpoint
CREATE VIEW "public"."view_sequencing_run_all_samples" AS (
WITH index_plate_well (source_well_id, index_plate_well_label) AS (
    SELECT
        source_well_id,
        string_agg(plate_well_label, ', ') as index_plate_well_label
    FROM (
        SELECT DISTINCT ON (wells.id)
            sequencing_run_samples.source_well_id,
            plates.name || ': ' || CHR(wells.y + 64) || wells.x AS plate_well_label
        FROM sequencing_run_samples
            JOIN well_contents on well_contents.well_id = source_well_id
            JOIN well_content_sources ON well_content_id = well_contents.id
            JOIN wells ON well_content_sources.source_well_id = wells.id
            JOIN plates ON wells.plate_id = plates.id
        WHERE plate_type = 'seq-index'
    )
    GROUP BY source_well_id
)
SELECT
  sequencing_run_samples.id AS id,
  CASE
    WHEN dna_pellets.name IS NOT NULL THEN dna_pellets.name || '_DNA'
    WHEN rna_pellets.name IS NOT NULL THEN rna_pellets.name || '_RNA'
    ELSE null
  END AS sample_name,
  sequencing_run_id,
  'internal' AS sample_type,
  dna_id,
  rna_id,
  NULL AS external_sample_id,
  index_primer_1_id,
  index_primer_2_id,
  primer1.index_sequence || ' (' || primer1.primer_type || ')' AS index_primer_1_label,
  primer2.index_sequence || ' (' || primer2.primer_type || ')' AS index_primer_2_label,
  index_plate_well_label,
  sequencing_run_samples.source_well_id,
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
  LEFT JOIN dna ON sequencing_run_samples.dna_id = dna.id
  LEFT JOIN rna ON sequencing_run_samples.rna_id = rna.id
  LEFT JOIN pellets AS dna_pellets ON dna.pellet_id = dna_pellets.id
  LEFT JOIN pellets AS rna_pellets ON rna.pellet_id = rna_pellets.id
  LEFT JOIN index_primers AS primer1 ON sequencing_run_samples.index_primer_1_id = primer1.id
  LEFT JOIN index_primers AS primer2 ON sequencing_run_samples.index_primer_2_id = primer2.id
  LEFT JOIN wells ON sequencing_run_samples.source_well_id = wells.id
  LEFT JOIN plates ON wells.plate_id = plates.id
  LEFT JOIN index_plate_well ON sequencing_run_samples.source_well_id = index_plate_well.source_well_id
  UNION
  SELECT
  sequencing_run_external_samples.id AS id,
  external_samples.name AS sample_name,
  sequencing_run_id,
  'external' AS sample_type,
  NULL AS dna_id,
  NULL AS rna_id,
  external_sample_id,
  COALESCE(sequencing_run_external_samples.index_primer_1_id, external_samples.index_primer_1_id) AS index_primer_1_id,
  COALESCE(sequencing_run_external_samples.index_primer_2_id, external_samples.index_primer_2_id) AS index_primer_2_id,
  COALESCE(primer1.index_sequence, ext_primer1.index_sequence) || ' (' || COALESCE(primer1.primer_type, ext_primer1.primer_type) || ')' AS index_primer_1_label,
  COALESCE(primer2.index_sequence, ext_primer2.index_sequence) || ' (' || COALESCE(primer2.primer_type, ext_primer2.primer_type) || ')' AS index_primer_2_label,
  NULL AS index_plate_well_label,
  source_well_id,
  wells.x AS source_well_x,
  wells.y AS source_well_y,
  plates.name AS source_plate_name,
  COALESCE(sequencing_run_external_samples.custom_index_seq_1, external_samples.custom_index_seq_1) as custom_index_seq_1,
  COALESCE(sequencing_run_external_samples.custom_index_seq_2, external_samples.custom_index_seq_2) as custom_index_seq_2,
  million_reads_required,
  CASE
    WHEN (COALESCE(sequencing_run_external_samples.index_primer_1_id, external_samples.index_primer_1_id) IS NOT NULL AND COALESCE(sequencing_run_external_samples.index_primer_2_id, external_samples.index_primer_2_id) IS NOT NULL) OR (COALESCE(TRIM(COALESCE(sequencing_run_external_samples.custom_index_seq_1, external_samples.custom_index_seq_1)), '') <> '' AND COALESCE(TRIM(COALESCE(sequencing_run_external_samples.custom_index_seq_2, external_samples.custom_index_seq_2)), '') <> '') THEN 'Y151;I10;I10;Y151'
    WHEN (COALESCE(sequencing_run_external_samples.index_primer_1_id, external_samples.index_primer_1_id) IS NOT NULL AND COALESCE(sequencing_run_external_samples.index_primer_2_id, external_samples.index_primer_2_id) IS NULL) OR (COALESCE(TRIM(COALESCE(sequencing_run_external_samples.custom_index_seq_1, external_samples.custom_index_seq_1)), '') <> '' AND COALESCE(TRIM(COALESCE(sequencing_run_external_samples.custom_index_seq_2, external_samples.custom_index_seq_2)), '') = '') THEN 'Y151;I10;N10;Y151'
    WHEN (COALESCE(sequencing_run_external_samples.index_primer_1_id, external_samples.index_primer_1_id) IS NULL AND COALESCE(sequencing_run_external_samples.index_primer_2_id, external_samples.index_primer_2_id) IS NOT NULL) OR (COALESCE(TRIM(COALESCE(sequencing_run_external_samples.custom_index_seq_1, external_samples.custom_index_seq_1)), '') = '' AND COALESCE(TRIM(COALESCE(sequencing_run_external_samples.custom_index_seq_2, external_samples.custom_index_seq_2)), '') <> '') THEN 'Y151;N10;I10;Y151'
  ELSE
    NULL
  END AS override_cycles,
  notes,
  sequencing_run_external_samples.created_at AS created_at
  FROM sequencing_run_external_samples
  JOIN external_samples ON sequencing_run_external_samples.external_sample_id = external_samples.id
  LEFT JOIN index_primers AS primer1 ON sequencing_run_external_samples.index_primer_1_id = primer1.id
  LEFT JOIN index_primers AS primer2 ON sequencing_run_external_samples.index_primer_2_id = primer2.id
  LEFT JOIN index_primers AS ext_primer1 ON external_samples.index_primer_1_id = ext_primer1.id
  LEFT JOIN index_primers AS ext_primer2 ON external_samples.index_primer_2_id = ext_primer2.id
  LEFT JOIN wells ON sequencing_run_external_samples.source_well_id = wells.id
  LEFT JOIN plates ON wells.plate_id = plates.id);