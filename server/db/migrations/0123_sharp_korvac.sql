CREATE TABLE "snv_lib_amp_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"snv_lib_cloning_experiment_id" uuid NOT NULL,
	"twist_lot_id" uuid,
	"amp_primer_forward_id" uuid NOT NULL,
	"amp_primer_reverse_id" uuid NOT NULL,
	"cleaned_on" timestamp,
	"cleaned_by" uuid,
	"quant" double precision,
	"start_position" integer,
	"stop_position" integer,
	"notes" text,
	CONSTRAINT "snv_lib_amp_products_name_unique" UNIQUE("name"),
	CONSTRAINT "snv_lib_amp_products_snv_lib_cloning_experiment_id_unique" UNIQUE("snv_lib_cloning_experiment_id")
);
--> statement-breakpoint
CREATE TABLE "snv_lib_gibson_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"snv_lib_cloning_experiment_id" uuid NOT NULL,
	"lin_product_vector_amount" double precision DEFAULT 50,
	"gibson_on" timestamp,
	"gibson_by" uuid,
	"cleaned_on" timestamp,
	"cleaned_by" uuid,
	"transformed_on" timestamp,
	"transformed_by" uuid,
	"prepped_on" timestamp,
	"prepped_by" uuid,
	"quant" double precision,
	"plasmidsaurus_checked" boolean DEFAULT false,
	"ngs_checked" boolean DEFAULT false,
	"passed_qc" boolean DEFAULT false,
	"benchling_link" text,
	"notes" text,
	CONSTRAINT "snv_lib_gibson_products_name_unique" UNIQUE("name"),
	CONSTRAINT "snv_lib_gibson_products_snv_lib_cloning_experiment_id_unique" UNIQUE("snv_lib_cloning_experiment_id")
);
--> statement-breakpoint
CREATE TABLE "snv_lib_lin_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"snv_lib_cloning_experiment_id" uuid NOT NULL,
	"ha_puc19_plasmid_id" uuid NOT NULL,
	"lin_primer_forward_id" uuid NOT NULL,
	"lin_primer_reverse_id" uuid NOT NULL,
	"dpn1_digest_on" timestamp,
	"dpn1_digest_by" uuid,
	"gel_extracted_on" timestamp,
	"gel_extracted_by" uuid,
	"quant" double precision,
	"notes" text,
	CONSTRAINT "snv_lib_lin_products_name_unique" UNIQUE("name"),
	CONSTRAINT "snv_lib_lin_products_snv_lib_cloning_experiment_id_unique" UNIQUE("snv_lib_cloning_experiment_id")
);
--> statement-breakpoint
DROP VIEW "public"."view_plates_with_well_counts";--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" DROP CONSTRAINT "snv_lib_cloning_experiments_technician_users_id_fk";
--> statement-breakpoint
ALTER TABLE "plates" DROP CONSTRAINT "plates_snv_lib_cloning_experiment_id_snv_lib_cloning_experiments_id_fk";
--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" ADD COLUMN "target_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" ADD COLUMN "started_on" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" ADD COLUMN "ended_on" timestamp;--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" ADD CONSTRAINT "snv_lib_amp_products_snv_lib_cloning_experiment_id_snv_lib_cloning_experiments_id_fk" FOREIGN KEY ("snv_lib_cloning_experiment_id") REFERENCES "public"."snv_lib_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" ADD CONSTRAINT "snv_lib_amp_products_twist_lot_id_lots_id_fk" FOREIGN KEY ("twist_lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" ADD CONSTRAINT "snv_lib_amp_products_amp_primer_forward_id_amplification_primers_id_fk" FOREIGN KEY ("amp_primer_forward_id") REFERENCES "public"."amplification_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" ADD CONSTRAINT "snv_lib_amp_products_amp_primer_reverse_id_amplification_primers_id_fk" FOREIGN KEY ("amp_primer_reverse_id") REFERENCES "public"."amplification_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" ADD CONSTRAINT "snv_lib_amp_products_cleaned_by_users_id_fk" FOREIGN KEY ("cleaned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_gibson_products" ADD CONSTRAINT "snv_lib_gibson_products_snv_lib_cloning_experiment_id_snv_lib_cloning_experiments_id_fk" FOREIGN KEY ("snv_lib_cloning_experiment_id") REFERENCES "public"."snv_lib_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_gibson_products" ADD CONSTRAINT "snv_lib_gibson_products_gibson_by_users_id_fk" FOREIGN KEY ("gibson_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_gibson_products" ADD CONSTRAINT "snv_lib_gibson_products_cleaned_by_users_id_fk" FOREIGN KEY ("cleaned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_gibson_products" ADD CONSTRAINT "snv_lib_gibson_products_transformed_by_users_id_fk" FOREIGN KEY ("transformed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_gibson_products" ADD CONSTRAINT "snv_lib_gibson_products_prepped_by_users_id_fk" FOREIGN KEY ("prepped_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_lin_products" ADD CONSTRAINT "snv_lib_lin_products_snv_lib_cloning_experiment_id_snv_lib_cloning_experiments_id_fk" FOREIGN KEY ("snv_lib_cloning_experiment_id") REFERENCES "public"."snv_lib_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_lin_products" ADD CONSTRAINT "snv_lib_lin_products_ha_puc19_plasmid_id_ha_puc19_plasmids_id_fk" FOREIGN KEY ("ha_puc19_plasmid_id") REFERENCES "public"."ha_puc19_plasmids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_lin_products" ADD CONSTRAINT "snv_lib_lin_products_lin_primer_forward_id_linearization_primers_id_fk" FOREIGN KEY ("lin_primer_forward_id") REFERENCES "public"."linearization_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_lin_products" ADD CONSTRAINT "snv_lib_lin_products_lin_primer_reverse_id_linearization_primers_id_fk" FOREIGN KEY ("lin_primer_reverse_id") REFERENCES "public"."linearization_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_lin_products" ADD CONSTRAINT "snv_lib_lin_products_dpn1_digest_by_users_id_fk" FOREIGN KEY ("dpn1_digest_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_lin_products" ADD CONSTRAINT "snv_lib_lin_products_gel_extracted_by_users_id_fk" FOREIGN KEY ("gel_extracted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" ADD CONSTRAINT "snv_lib_cloning_experiments_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" DROP COLUMN "technician";--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" DROP COLUMN "transformed_on";--> statement-breakpoint
ALTER TABLE "plates" DROP COLUMN "snv_lib_cloning_experiment_id";--> statement-breakpoint
CREATE VIEW "public"."view_plates_with_well_counts" AS (with plate_types(plate_type_value, plate_type_label, plate_type_desc) AS (VALUES ('pellet-storage', 'Pellet storage', 'Pellet storage'), ('lin-primer-storage', 'LIN primer storage', 'Linearization primer storage'), ('amp-primer-storage', 'AMP primer storage', 'Amplification primer storage'), ('ha-primer-storage', 'HA primer storage', 'Homology arm primer storage'), ('ha-puc19-primer-storage', 'HA pUC19 primer storage', 'Homology arm pUC19 arm primer storage'), ('sg-rna-oligo-storage', 'sgRNA oligo storage', 'sgRNA oligo storage'), ('sg-rna-oligo', 'sgRNA oligo', 'sgRNA oligo'), ('sg-rna-plasmid', 'sgRNA plasmid', 'sgRNA plasmid'), ('lin-pcr', 'LIN PCR', 'Linearization primer PCR'), ('amp-pcr', 'AMP PCR', 'Amplification primer PCR'), ('ha-pcr', 'HA PCR', 'Homology arm primer PCR'), ('preseq-1', 'PreSeq 1', 'PreSeq 1'), ('preseq-2', 'PreSeq 2', 'PreSeq 2'), ('preseq-3', 'PreSeq 3', 'PreSeq 3'), ('snv-lib-preseq-2', 'SNV-lib PreSeq 2', 'SNV-lib PreSeq 2'), ('snv-lib-preseq-3', 'SNV-lib PreSeq 3', 'SNV-lib PreSeq 3'), ('seq-index', 'Seq index', 'Sequencing index plate'), ('pcr1-primer-storage', 'PreSeq 1 primer storage', 'PreSeq 1 primer storage'), ('pcr2-primer-storage', 'PreSeq 2 primer storage', 'PreSeq 2 primer storage'), ('external-sample-indexing', 'External sample indexing', 'External sample indexing')) select
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
