CREATE VIEW "public"."view_plates_with_well_counts" AS (with plate_types(plate_type_value, plate_type_label, plate_type_desc) AS (VALUES ('lin-storage', 'LIN primer storage', 'Linearization primer storage'), ('amp-storage', 'AMP primer storage', 'Amplification primer storage'), ('ha-storage', 'HA primer storage', 'Homology arm primer storage'), ('guide-rna-storage', 'Guide RNA storage', 'Guide RNA storage'), ('lin-pcr', 'LIN PCR', 'Linearization primer PCR'), ('amp-pcr', 'AMP PCR', 'Amplification primer PCR'), ('ha-pcr', 'HA PCR', 'Homology arm primer PCR'), ('pcr-1', 'PCR 1', 'PCR 1'), ('pcr-2', 'PCR 2', 'PCR 2'), ('pcr-3', 'PCR 3', 'PCR 3')) select
    "plates"."id",
    "plates"."pcr_experiment_id",
    "plates"."name",
    "plates"."size_x",
    "plates"."size_y",
    "plates"."plate_type",
    (select distinct on (plate_type_value) plate_type_label from plate_types where plate_type_value = "plates"."plate_type") as plate_type_label,
    count("wells"."id") as wells_count,
    count("well_contents"."well_id") as wells_with_content_count
    from "plates"
    join "wells" on "plates"."id" = "wells"."plate_id"
    left join "well_contents" on "wells"."id" = "well_contents"."well_id"
    group by "plates"."id");