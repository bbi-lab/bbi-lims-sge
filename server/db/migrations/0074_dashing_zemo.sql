CREATE VIEW "public"."view_sequencing_run_errors" AS (SELECT
    sequencing_run_id as id,
    array_agg(error_msg) as error_messages from (
	    WITH sequencing_run_well_contents as (
        SELECT
            "sequencing_runs"."id" AS sequencing_run_id,
            array_agg("index_primers"."id" ORDER BY "index_primers"."primer_type") FILTER (WHERE "index_primers"."id" IS NOT NULL) AS index_primer_ids,
            array_agg("nucleic_acids"."id" ORDER BY "nucleic_acids"."id") FILTER (WHERE "nucleic_acids"."id" IS NOT NULL) AS nucleic_acid_ids
          FROM "well_contents"
            LEFT JOIN "index_primers" ON "well_contents"."index_primer_id" = "index_primers"."id"
            LEFT JOIN "nucleic_acids" ON "well_contents"."nucleic_acid_id" = "nucleic_acids"."id"
            JOIN "wells" ON "well_contents"."well_id" = "wells"."id"
            JOIN "plates" ON "wells"."plate_id" = "plates"."id"
            JOIN "sequencing_runs" ON "plates"."sequencing_run_id" = "sequencing_runs"."id"
          GROUP BY "wells"."id", "sequencing_runs"."id"
      )
      select sequencing_run_id, 'Repeated index primers' as error_msg from (
        select sequencing_run_id,  index_primer_ids, count(*) as index_primer_count
        from sequencing_run_well_contents
        where index_primer_ids IS NOT NULL
        group by sequencing_run_id, index_primer_ids)
      where index_primer_count > 1
      UNION
      Select sequencing_run_id, 'Missing index primers' as error_msg FROM sequencing_run_well_contents WHERE index_primer_ids is NULL
      UNION
      Select sequencing_run_id, 'Too many index primers in well' as error_msg FROM sequencing_run_well_contents WHERE cardinality(index_primer_ids) > 2
      UNION
      Select sequencing_run_id, 'Missing nucleic acids' as error_msg FROM sequencing_run_well_contents WHERE nucleic_acid_ids is NULL
      UNION
      Select sequencing_run_id, 'Too many nucleic acids in well' as error_msg FROM sequencing_run_well_contents WHERE cardinality(nucleic_acid_ids) > 1
) group by sequencing_run_id);