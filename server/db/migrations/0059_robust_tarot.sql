DROP VIEW "public"."view_plates_with_well_counts";--> statement-breakpoint
CREATE VIEW "public"."view_plates_with_well_counts" AS (with plate_types(plate_type_value, plate_type_label, plate_type_desc) AS (VALUES ('lin-storage', 'LIN primer storage', 'Linearization primer storage'), ('amp-storage', 'AMP primer storage', 'Amplification primer storage'), ('ha-storage', 'HA primer storage', 'Homology arm primer storage'), ('guide-rna-storage', 'Guide RNA storage', 'Guide RNA storage'), ('lin-pcr', 'LIN PCR', 'Linearization primer PCR'), ('amp-pcr', 'AMP PCR', 'Amplification primer PCR'), ('ha-pcr', 'HA PCR', 'Homology arm primer PCR'), ('preseq-1', 'PreSeq 1', 'PreSeq 1'), ('preseq-2', 'PreSeq 2', 'PreSeq 2'), ('preseq-3', 'PreSeq 3', 'PreSeq 3'), ('seq-index', 'Seq index', 'Sequencing index plate')) select
    "plates"."id",
    "plates"."pcr_experiment_id",
    "plates"."name",
    "plates"."size_x",
    "plates"."size_y",
    "plates"."plate_type",
    "plates"."discarded",
    "plates"."processed",
    "cycles"."id" as cycle_id,
    "cycles"."name" as cycle_name,
    string_agg(distinct "targets"."name", ',') as targets,
    (select distinct on (plate_type_value) plate_type_label from plate_types where plate_type_value = "plates"."plate_type") as plate_type_label,
    count(distinct("wells"."id")) as wells_count,
    count(distinct("well_contents"."well_id")) as wells_with_content_count
    from "plates"
    join "wells" on "plates"."id" = "wells"."plate_id"
    left join "well_contents" on "wells"."id" = "well_contents"."well_id"
    left join "pcr_experiments" on "plates"."pcr_experiment_id" = "pcr_experiments"."id"
    left join "transfect_targets" on "pcr_experiments"."transfect_target_id" = "transfect_targets"."id"
    left join "targets" on "targets"."id" = "transfect_targets"."target_id"
    left join "transfect_experiments" on "transfect_targets"."experiment_id" = "transfect_experiments"."id"
    left join "cycles" on "transfect_experiments"."cycle_id" = "cycles"."id" or "pcr_experiments"."cycle_id" = "cycles"."id"
    group by "plates"."id", "cycles"."id");