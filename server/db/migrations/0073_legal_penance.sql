DROP VIEW "public"."view_sequencing_run_well_contents";--> statement-breakpoint
CREATE VIEW "public"."view_sequencing_run_well_contents" AS (SELECT
    "wells"."id" as id,
    "wells"."x" as well_x,
    "wells"."y" as well_y,
    "plates"."id" as plate_id,
    "plates"."name" as plate_name,
    "sequencing_runs"."id" AS sequencing_run_id,
    "sequencing_runs"."name" AS sequencing_run_name,
    array_agg("index_primers"."id" ORDER BY "index_primers"."primer_type") FILTER (WHERE "index_primers"."id" IS NOT NULL) AS index_primer_ids,
    array_agg("index_primers"."index_sequence" || ' (' || "index_primers"."primer_type" || ')' ORDER BY "index_primers"."primer_type") FILTER (WHERE "index_primers"."id" IS NOT NULL) AS index_primer_sequences,
    array_agg("nucleic_acids"."id" ORDER BY "nucleic_acids"."id") FILTER (WHERE "nucleic_acids"."id" IS NOT NULL) AS nucleic_acid_ids,
    array_agg("pellets"."name" ORDER BY "nucleic_acids"."id") FILTER (WHERE "nucleic_acids"."id" IS NOT NULL) AS pellet_names
    FROM "well_contents"
      LEFT JOIN "index_primers" ON  "well_contents"."index_primer_id" = "index_primers"."id"
      LEFT JOIN "nucleic_acids" ON "well_contents"."nucleic_acid_id" = "nucleic_acids"."id"
      LEFT JOIN "pellets" ON "nucleic_acids"."pellet_id" = "pellets"."id"
      JOIN "wells" ON "well_contents"."well_id" = "wells"."id"
      JOIN "plates" ON "wells"."plate_id" = "plates"."id"
      JOIN "sequencing_runs" ON "plates"."sequencing_run_id" = "sequencing_runs"."id"
  WHERE "sequencing_runs"."status" IN ('pending', 'running')
  GROUP BY "wells"."id", "plates"."id", "sequencing_runs"."id");