DROP VIEW "public"."view_plates_with_well_counts";--> statement-breakpoint
ALTER TABLE "wellables" DROP CONSTRAINT "wellable_table_name";--> statement-breakpoint
ALTER TABLE "wellables" ADD CONSTRAINT "wellable_table_name" CHECK ("wellables"."table_name" IN (
      'amplification_primers',
      'linearization_primers',
      'homology_arm_primers',
      'homology_arm_puc19_primers',
      'preseq_1_primers',
      'preseq_2_primers',
      'index_primers',
      'nucleic_acids',
      'pellets',
      'sg_rna_plasmids',
      'snv_lib_plasmids',
      'sg_rna_oligos',
      'external_samples',
      'ha_pcr_products',
      'ha_puc19_pcr_products',
      'ha_puc19_gibson_products',
      'ha_puc19_plasmids',
      'snv_lib_amp_products',
      'snv_lib_lin_products',
      'snv_lib_gibson_products'
    ));--> statement-breakpoint
CREATE VIEW "public"."view_plates_with_well_counts" AS (with plate_types(plate_type_value, plate_type_label, plate_type_desc) AS (VALUES ('pellet-storage', 'Pellet storage', 'Pellet storage'), ('lin-primer-storage', 'LIN primer storage', 'Linearization primer storage'), ('amp-primer-storage', 'AMP primer storage', 'Amplification primer storage'), ('ha-primer-storage', 'HA primer storage', 'Homology arm primer storage'), ('ha-puc19-primer-storage', 'HA pUC19 primer storage', 'Homology arm pUC19 arm primer storage'), ('sg-rna-oligo-storage', 'sgRNA oligo storage', 'sgRNA oligo storage'), ('sg-rna-oligo', 'sgRNA oligo', 'sgRNA oligo'), ('sg-rna-plasmid', 'sgRNA plasmid', 'sgRNA plasmid'), ('lin-pcr', 'LIN PCR', 'Linearization primer PCR'), ('amp-pcr', 'AMP PCR', 'Amplification primer PCR'), ('ha-pcr', 'HA PCR', 'Homology arm primer PCR'), ('preseq-1', 'PreSeq 1', 'PreSeq 1'), ('preseq-2', 'PreSeq 2', 'PreSeq 2'), ('preseq-3', 'PreSeq 3', 'PreSeq 3'), ('snv-lib-preseq-2', 'SNVlib PreSeq 2', 'SNVlib PreSeq 2'), ('snv-lib-preseq-3', 'SNVlib PreSeq 3', 'SNVlib PreSeq 3'), ('seq-index', 'Seq index', 'Sequencing index plate'), ('pcr1-primer-storage', 'PreSeq 1 primer storage', 'PreSeq 1 primer storage'), ('pcr2-primer-storage', 'PreSeq 2 primer storage', 'PreSeq 2 primer storage'), ('external-sample-indexing', 'External sample indexing', 'External sample indexing'), ('ha-pcr-product-storage', 'HA PCR product storage', 'HA PCR product storage'), ('ha-puc19-pcr-product-storage', 'HA pUC19 PCR product storage', 'HA pUC19 PCR product storage'), ('ha-puc19-gibson-product-storage', 'HA pUC19 Gibson product storage', 'HA pUC19 Gibson product storage'), ('ha-puc19-plasmid-storage', 'HA pUC19 plasmid storage', 'HA pUC19 plasmid storage'), ('snv-lib-amp-product-storage', 'SNVlib AMP product storage', 'SNVlib AMP product storage'), ('snv-lib-lin-product-storage', 'SNVlib LIN product storage', 'SNVlib LIN product storage'), ('snv-lib-gibson-product-storage', 'SNVlib Gibson product storage', 'SNVlib Gibson product storage'), ('snv-lib-plasmid-storage', 'SNVlib plasmid storage', 'SNVlib plasmid storage')) select
    "plates"."id",
    "plates"."pcr_experiment_id",
    "plates"."sg_rna_cloning_experiment_id",
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
    count(distinct("well_contents"."well_id")) as wells_with_content_count,
    count(distinct("well_content_sources"."source_well_id")) as wells_processed_count
    from "plates"
    join "wells" on "plates"."id" = "wells"."plate_id"
    left join "well_content_sources" on "wells"."id" = "well_content_sources"."source_well_id"
    left join "well_contents" on "wells"."id" = "well_contents"."well_id"
    left join "pcr_experiments" on "plates"."pcr_experiment_id" = "pcr_experiments"."id"
    left join "transfect_targets" on "pcr_experiments"."transfect_target_id" = "transfect_targets"."id"
    left join "targets" on "targets"."id" = "transfect_targets"."target_id"
    left join "transfect_experiments" on "transfect_targets"."experiment_id" = "transfect_experiments"."id"
    left join "cycles" on "transfect_experiments"."cycle_id" = "cycles"."id"
    group by "plates"."id", "cycles"."id");--> statement-breakpoint

CREATE OR REPLACE TRIGGER "snv_lib_amp_products_wellables_insert"
BEFORE INSERT ON "snv_lib_amp_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "snv_lib_amp_products_wellables_delete"
BEFORE DELETE ON "snv_lib_amp_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "snv_lib_lin_products_wellables_insert"
BEFORE INSERT ON "snv_lib_lin_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "snv_lib_lin_products_wellables_delete"
BEFORE DELETE ON "snv_lib_lin_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "snv_lib_gibson_products_wellables_insert"
BEFORE INSERT ON "snv_lib_gibson_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "snv_lib_gibson_products_wellables_delete"
BEFORE DELETE ON "snv_lib_gibson_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();
