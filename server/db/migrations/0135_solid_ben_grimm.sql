CREATE TABLE "snv_lib_clonal_dna_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"snv_lib_cloning_experiment_id" uuid NOT NULL,
	"gel_extracted_on" timestamp,
	"gel_extracted_by" uuid,
	"quant" double precision,
	"size" integer,
	"notes" text,
	CONSTRAINT "snv_lib_clonal_dna_products_name_unique" UNIQUE("name"),
	CONSTRAINT "snv_lib_clonal_dna_products_snv_lib_cloning_experiment_id_unique" UNIQUE("snv_lib_cloning_experiment_id")
);
--> statement-breakpoint
CREATE TABLE "snv_lib_golden_gate_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"snv_lib_cloning_experiment_id" uuid NOT NULL,
	"snv_lib_amp_product_id" uuid NOT NULL,
	"snv_lib_clonal_dna_product_id" uuid NOT NULL,
	"golden_gate_product_vector_amount" double precision DEFAULT 50,
	"notes" text,
	CONSTRAINT "snv_lib_golden_gate_products_name_unique" UNIQUE("name"),
	CONSTRAINT "snv_lib_golden_gate_products_snv_lib_cloning_experiment_id_unique" UNIQUE("snv_lib_cloning_experiment_id"),
	CONSTRAINT "snv_lib_golden_gate_products_snv_lib_amp_product_id_unique" UNIQUE("snv_lib_amp_product_id"),
	CONSTRAINT "snv_lib_golden_gate_products_snv_lib_clonal_dna_product_id_unique" UNIQUE("snv_lib_clonal_dna_product_id")
);
--> statement-breakpoint
DROP VIEW "public"."view_plates_with_well_counts";--> statement-breakpoint
ALTER TABLE "wellables" DROP CONSTRAINT "wellable_table_name";--> statement-breakpoint
ALTER TABLE "snv_lib_clonal_dna_products" ADD CONSTRAINT "snv_lib_clonal_dna_products_snv_lib_cloning_experiment_id_snv_lib_cloning_experiments_id_fk" FOREIGN KEY ("snv_lib_cloning_experiment_id") REFERENCES "public"."snv_lib_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_clonal_dna_products" ADD CONSTRAINT "snv_lib_clonal_dna_products_gel_extracted_by_users_id_fk" FOREIGN KEY ("gel_extracted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_golden_gate_products" ADD CONSTRAINT "snv_lib_golden_gate_products_snv_lib_cloning_experiment_id_snv_lib_cloning_experiments_id_fk" FOREIGN KEY ("snv_lib_cloning_experiment_id") REFERENCES "public"."snv_lib_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_golden_gate_products" ADD CONSTRAINT "snv_lib_golden_gate_products_snv_lib_amp_product_id_snv_lib_amp_products_id_fk" FOREIGN KEY ("snv_lib_amp_product_id") REFERENCES "public"."snv_lib_amp_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_golden_gate_products" ADD CONSTRAINT "snv_lib_golden_gate_products_snv_lib_clonal_dna_product_id_snv_lib_clonal_dna_products_id_fk" FOREIGN KEY ("snv_lib_clonal_dna_product_id") REFERENCES "public"."snv_lib_clonal_dna_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
      'snv_lib_gibson_products',
      'snv_lib_plasmids',
      'snv_lib_clonal_dna_products',
      'snv_lib_golden_gate_products'
    ));--> statement-breakpoint
CREATE VIEW "public"."view_plates_with_well_counts" AS (with plate_types(plate_type_value, plate_type_label, plate_type_desc) AS (VALUES ('pellet-storage', 'Pellet storage', 'Pellet storage'), ('lin-primer-storage', 'LIN primer storage', 'Linearization primer storage'), ('amp-primer-storage', 'AMP primer storage', 'Amplification primer storage'), ('ha-primer-storage', 'HA primer storage', 'Homology arm primer storage'), ('ha-puc19-primer-storage', 'HA pUC19 primer storage', 'Homology arm pUC19 arm primer storage'), ('sg-rna-oligo-storage', 'sgRNA oligo storage', 'sgRNA oligo storage'), ('sg-rna-oligo', 'sgRNA oligo', 'sgRNA oligo'), ('sg-rna-plasmid', 'sgRNA plasmid', 'sgRNA plasmid'), ('lin-pcr', 'LIN PCR', 'Linearization primer PCR'), ('amp-pcr', 'AMP PCR', 'Amplification primer PCR'), ('ha-pcr', 'HA PCR', 'Homology arm primer PCR'), ('preseq-1', 'PreSeq 1', 'PreSeq 1'), ('preseq-2', 'PreSeq 2', 'PreSeq 2'), ('preseq-3', 'PreSeq 3', 'PreSeq 3'), ('snv-lib-preseq-2', 'SNVlib PreSeq 2', 'SNVlib PreSeq 2'), ('snv-lib-preseq-3', 'SNVlib PreSeq 3', 'SNVlib PreSeq 3'), ('seq-index', 'Seq index', 'Sequencing index plate'), ('pcr1-primer-storage', 'PreSeq 1 primer storage', 'PreSeq 1 primer storage'), ('pcr2-primer-storage', 'PreSeq 2 primer storage', 'PreSeq 2 primer storage'), ('external-sample-indexing', 'External sample indexing', 'External sample indexing'), ('ha-pcr-product-storage', 'HA PCR product storage', 'HA PCR product storage'), ('ha-puc19-pcr-product-storage', 'HA pUC19 PCR product storage', 'HA pUC19 PCR product storage'), ('ha-puc19-gibson-product-storage', 'HA pUC19 Gibson product storage', 'HA pUC19 Gibson product storage'), ('ha-puc19-plasmid-storage', 'HA pUC19 plasmid storage', 'HA pUC19 plasmid storage'), ('snv-lib-amp-product-storage', 'SNVlib AMP product storage', 'SNVlib AMP product storage'), ('snv-lib-lin-product-storage', 'SNVlib LIN product storage', 'SNVlib LIN product storage'), ('snv-lib-gibson-product-storage', 'SNVlib Gibson product storage', 'SNVlib Gibson product storage'), ('snv-lib-plasmid-storage', 'SNVlib plasmid storage', 'SNVlib plasmid storage'), ('snv-lib-clonal-dna-product-storage', 'SNVlib clonal DNA product storage', 'SNVlib clonal DNA product storage'), ('snv-lib-golden-gate-product-storage', 'SNVlib Golden Gate product storage', 'SNVlib Golden Gate product storage')) select
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
    group by "plates"."id", "cycles"."id");