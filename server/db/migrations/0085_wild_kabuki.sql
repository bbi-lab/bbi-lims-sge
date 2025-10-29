CREATE TABLE "sg_rna_cloning_experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"technician" uuid,
	"transformed_on" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "snv_lib_cloning_experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"technician" uuid,
	"transformed_on" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sg_rna_plasmids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"volume" double precision,
	"quant" double precision,
	"target_id" uuid NOT NULL,
	"sg_rna_cloning_experiment_id" uuid,
	"verification_status" varchar,
	"external_link" text,
	"notes" text,
	CONSTRAINT "sg_rna_plasmids_name_unique" UNIQUE("name"),
	CONSTRAINT "external_link_check" CHECK ("sg_rna_plasmids"."external_link" ~* '^https?://.+$')
);
--> statement-breakpoint
CREATE TABLE "snv_lib_plasmids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"volume" double precision,
	"quant" double precision,
	"target_id" uuid NOT NULL,
	"snv_lib_cloning_experiment_id" uuid,
	"verification_status" varchar,
	"external_link" text,
	"notes" text,
	CONSTRAINT "snv_lib_plasmids_name_unique" UNIQUE("name"),
	CONSTRAINT "external_link_check" CHECK ("snv_lib_plasmids"."external_link" ~* '^https?://.+$')
);
--> statement-breakpoint
ALTER TABLE "plasmid_experiments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "plasmids" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP VIEW "public"."view_plates_with_well_counts";--> statement-breakpoint
DROP TABLE "plasmid_experiments" CASCADE;--> statement-breakpoint
DROP TABLE "plasmids" CASCADE;--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "one_item_per_well_content";--> statement-breakpoint
ALTER TABLE "plates" DROP CONSTRAINT "plates_plasmid_experiment_id_plasmid_experiments_id_fk";
--> statement-breakpoint
ALTER TABLE "transfect_targets" DROP CONSTRAINT "transfect_targets_snv_lib_plasmids_id_fk";
--> statement-breakpoint
ALTER TABLE "transfect_targets" DROP CONSTRAINT "transfect_targets_sg_rna_plasmids_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_plasmid_id_plasmids_id_fk";
--> statement-breakpoint
ALTER TABLE "plates" ADD COLUMN "sg_rna_cloning_experiment_id" uuid;--> statement-breakpoint
ALTER TABLE "plates" ADD COLUMN "snv_lib_cloning_experiment_id" uuid;--> statement-breakpoint
ALTER TABLE "transfect_targets" ADD COLUMN "snv_lib_plasmid_id" uuid;--> statement-breakpoint
ALTER TABLE "transfect_targets" ADD COLUMN "sg_rna_plasmid_id" uuid;--> statement-breakpoint
ALTER TABLE "well_contents" ADD COLUMN "sg_rna_plasmid_id" uuid;--> statement-breakpoint
ALTER TABLE "well_contents" ADD COLUMN "snv_lib_plasmid_id" uuid;--> statement-breakpoint
ALTER TABLE "sg_rna_cloning_experiments" ADD CONSTRAINT "sg_rna_cloning_experiments_technician_users_id_fk" FOREIGN KEY ("technician") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" ADD CONSTRAINT "snv_lib_cloning_experiments_technician_users_id_fk" FOREIGN KEY ("technician") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sg_rna_plasmids" ADD CONSTRAINT "sg_rna_plasmids_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sg_rna_plasmids" ADD CONSTRAINT "sg_rna_plasmids_sg_rna_cloning_experiment_id_sg_rna_cloning_experiments_id_fk" FOREIGN KEY ("sg_rna_cloning_experiment_id") REFERENCES "public"."sg_rna_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_plasmids" ADD CONSTRAINT "snv_lib_plasmids_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_plasmids" ADD CONSTRAINT "snv_lib_plasmids_snv_lib_cloning_experiment_id_snv_lib_cloning_experiments_id_fk" FOREIGN KEY ("snv_lib_cloning_experiment_id") REFERENCES "public"."snv_lib_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plates" ADD CONSTRAINT "plates_sg_rna_cloning_experiment_id_sg_rna_cloning_experiments_id_fk" FOREIGN KEY ("sg_rna_cloning_experiment_id") REFERENCES "public"."sg_rna_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plates" ADD CONSTRAINT "plates_snv_lib_cloning_experiment_id_snv_lib_cloning_experiments_id_fk" FOREIGN KEY ("snv_lib_cloning_experiment_id") REFERENCES "public"."snv_lib_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfect_targets" ADD CONSTRAINT "transfect_targets_snv_lib_plasmid_id_snv_lib_plasmids_id_fk" FOREIGN KEY ("snv_lib_plasmid_id") REFERENCES "public"."snv_lib_plasmids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfect_targets" ADD CONSTRAINT "transfect_targets_sg_rna_plasmid_id_sg_rna_plasmids_id_fk" FOREIGN KEY ("sg_rna_plasmid_id") REFERENCES "public"."sg_rna_plasmids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_sg_rna_plasmid_id_sg_rna_plasmids_id_fk" FOREIGN KEY ("sg_rna_plasmid_id") REFERENCES "public"."sg_rna_plasmids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_snv_lib_plasmid_id_snv_lib_plasmids_id_fk" FOREIGN KEY ("snv_lib_plasmid_id") REFERENCES "public"."snv_lib_plasmids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plates" DROP COLUMN "plasmid_experiment_id";--> statement-breakpoint
ALTER TABLE "transfect_targets" DROP COLUMN "snv_lib";--> statement-breakpoint
ALTER TABLE "transfect_targets" DROP COLUMN "sg_rna";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "plasmid_id";--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "one_item_per_well_content" CHECK (num_nonnulls("well_contents"."amplification_primer_id", "well_contents"."linearization_primer_id", "well_contents"."homology_arm_primer_id", "well_contents"."index_primer_id", "well_contents"."nucleic_acid_id", "well_contents"."pellet_id", "well_contents"."sg_rna_plasmid_id", "well_contents"."snv_lib_plasmid_id", "well_contents"."oligo_id") = 1);--> statement-breakpoint
CREATE VIEW "public"."view_plates_with_well_counts" AS (with plate_types(plate_type_value, plate_type_label, plate_type_desc) AS (VALUES ('pellet-storage', 'Pellet storage', 'Pellet storage'), ('lin-storage', 'LIN primer storage', 'Linearization primer storage'), ('amp-storage', 'AMP primer storage', 'Amplification primer storage'), ('ha-storage', 'HA primer storage', 'Homology arm primer storage'), ('guide-rna-storage', 'Guide RNA storage', 'Guide RNA storage'), ('guide-rna', 'Guide RNA', 'Guide RNA'), ('lin-pcr', 'LIN PCR', 'Linearization primer PCR'), ('amp-pcr', 'AMP PCR', 'Amplification primer PCR'), ('ha-pcr', 'HA PCR', 'Homology arm primer PCR'), ('preseq-1', 'PreSeq 1', 'PreSeq 1'), ('preseq-2', 'PreSeq 2', 'PreSeq 2'), ('preseq-3', 'PreSeq 3', 'PreSeq 3'), ('snv-lib-preseq-2', 'SNV-lib PreSeq 2', 'SNV-lib PreSeq 2'), ('snv-lib-preseq-3', 'SNV-lib PreSeq 3', 'SNV-lib PreSeq 3'), ('seq-index', 'Seq index', 'Sequencing index plate')) select
    "plates"."id",
    "plates"."pcr_experiment_id",
    "plates"."sg_rna_cloning_experiment_id",
    "plates"."snv_lib_cloning_experiment_id",
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
