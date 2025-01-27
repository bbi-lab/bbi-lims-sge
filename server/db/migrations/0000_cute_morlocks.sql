CREATE TYPE "public"."gene_orientations" AS ENUM('plus', 'minus');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"started_on" timestamp DEFAULT now(),
	"ended_on" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "extraction_experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"technician" uuid,
	"extractedOn" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "genes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ncbi_accession" varchar(50),
	"start_position" integer,
	"end_position" integer,
	"chromosome" varchar(10),
	"orientation" "gene_orientations",
	"name" varchar(255),
	"symbol" varchar(50),
	"ncbi_gene_id" integer,
	"gene_type" varchar(50),
	"transcripts_accession" varchar(50),
	"protein_acccession" varchar(50),
	"protein_length" integer,
	"locus_tag" varchar(50),
	"assembly" varchar(50),
	"annotation" varchar(50)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pcr_experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"round" smallint,
	"technician" uuid,
	"started_on" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pellets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfect_target_id" uuid NOT NULL,
	"replicates" varchar(3)[],
	"harvested_on" timestamp,
	"harvested_by" uuid,
	"is_current" boolean,
	"is_backup" boolean,
	"quant" double precision,
	"storage_box_id" uuid,
	"storage_box_loc" varchar,
	"d3_confluency" double precision,
	"dna_concentration" double precision,
	"dna_volume" double precision,
	"dna_yield" double precision,
	"rna_concentration" double precision,
	"rna_volume" double precision,
	"rna_yield" double precision,
	"pct_passaged" double precision,
	"pct_harvested" double precision,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plasmid_experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"technician" uuid,
	"started_on" timestamp DEFAULT now(),
	"temperature" numeric
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pcr_experiment_id" uuid,
	"name" varchar(255) NOT NULL,
	"size_x" smallint DEFAULT 12 NOT NULL,
	"size_y" smallint DEFAULT 8 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"started_on" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"gene_id" uuid NOT NULL,
	"amplicon_start" integer,
	"amplicon_end" integer,
	"amplicon_sequence" varchar(255),
	"snv_library_start" integer,
	"snv_library_end" integer,
	"fixed_edits" varchar(255)[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage_boxes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"project_id" uuid,
	"cycle_id" uuid,
	"region_id" uuid NOT NULL,
	"fixed_edits" varchar(255)[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transfect_experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"technician" uuid,
	"started_on" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transfect_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experiment_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"snv_library_conc" double precision,
	"snv_library_to_3ug_vol" double precision,
	"sg_rna" varchar(255),
	"sg_rna_conc" double precision,
	"sg_rna_to_12ug_vol" double precision,
	"sg_rna_neg_control" varchar(255),
	"hprt1_sg_rna_conc" double precision,
	"hprt1_sg_rna_to_12ug_vol" double precision,
	"xfect_buffer" double precision,
	"xfect_polymer_per_transfect" double precision,
	"transfection_count" integer,
	"snv_lib_needed" double precision,
	"sg_rna_needed" double precision,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wells" (
	"plate_id" uuid NOT NULL,
	"x" smallint NOT NULL,
	"y" smallint NOT NULL,
	CONSTRAINT "wells_plate_id_x_y_pk" PRIMARY KEY("plate_id","x","y")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_group_memberships" (
	"user_id" uuid NOT NULL,
	"user_group_id" integer NOT NULL,
	CONSTRAINT "user_group_memberships_user_id_user_group_id_pk" PRIMARY KEY("user_id","user_group_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_groups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_groups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"password" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "extraction_experiments" ADD CONSTRAINT "extraction_experiments_technician_users_id_fk" FOREIGN KEY ("technician") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pcr_experiments" ADD CONSTRAINT "pcr_experiments_technician_users_id_fk" FOREIGN KEY ("technician") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pellets" ADD CONSTRAINT "pellets_transfect_target_id_transfect_targets_id_fk" FOREIGN KEY ("transfect_target_id") REFERENCES "public"."transfect_targets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pellets" ADD CONSTRAINT "pellets_harvested_by_users_id_fk" FOREIGN KEY ("harvested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pellets" ADD CONSTRAINT "pellets_storage_box_id_storage_boxes_id_fk" FOREIGN KEY ("storage_box_id") REFERENCES "public"."storage_boxes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plasmid_experiments" ADD CONSTRAINT "plasmid_experiments_technician_users_id_fk" FOREIGN KEY ("technician") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plates" ADD CONSTRAINT "plates_pcr_experiment_id_pcr_experiments_id_fk" FOREIGN KEY ("pcr_experiment_id") REFERENCES "public"."pcr_experiments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "regions" ADD CONSTRAINT "regions_gene_id_genes_id_fk" FOREIGN KEY ("gene_id") REFERENCES "public"."genes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "targets" ADD CONSTRAINT "targets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "targets" ADD CONSTRAINT "targets_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "targets" ADD CONSTRAINT "targets_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transfect_experiments" ADD CONSTRAINT "transfect_experiments_technician_users_id_fk" FOREIGN KEY ("technician") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transfect_targets" ADD CONSTRAINT "transfect_targets_experiment_id_transfect_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."transfect_experiments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transfect_targets" ADD CONSTRAINT "transfect_targets_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wells" ADD CONSTRAINT "wells_plate_id_plates_id_fk" FOREIGN KEY ("plate_id") REFERENCES "public"."plates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_group_memberships" ADD CONSTRAINT "user_group_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_group_memberships" ADD CONSTRAINT "user_group_memberships_user_group_id_user_groups_id_fk" FOREIGN KEY ("user_group_id") REFERENCES "public"."user_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
