CREATE TABLE "ha_pcr_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"ha_cloning_experiment_id" uuid,
	"start_position" integer,
	"stop_position" integer,
	"ha_primer_forward" uuid,
	"ha_primer_reverse" uuid,
	"wt_hap1_dna_concentration" double precision,
	"temperature_chosen" double precision,
	"performed_on" timestamp,
	"performed_by" uuid,
	"notes" text,
	CONSTRAINT "ha_pcr_products_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ha_puc19_gibson_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"ha_pcr_product_id" uuid,
	"puc19_vector_concentration" double precision,
	"puc19_vector_amount" double precision DEFAULT 50,
	"prepped_on" timestamp,
	"prepped_by" uuid,
	"quant" double precision,
	"notes" text,
	CONSTRAINT "ha_puc19_gibson_products_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ha_puc19_pcr_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"ha_pcr_product_id" uuid,
	"ha_puc19_primer_forward" uuid,
	"ha_puc19_primer_reverse" uuid,
	"temperature_used" double precision,
	"cleaned_on" timestamp,
	"cleaned_by" uuid,
	"quant" double precision,
	"notes" text,
	CONSTRAINT "ha_puc19_pcr_products_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ha_cloning_experiment_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ha_cloning_experiment_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	CONSTRAINT "unique_ha_cloning_experiment_target" UNIQUE("ha_cloning_experiment_id","target_id")
);
--> statement-breakpoint
CREATE TABLE "ha_cloning_experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"started_on" timestamp DEFAULT now(),
	"ended_on" timestamp
);
--> statement-breakpoint
CREATE TABLE "ha_puc19_plasmids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"ha_puc19_gibson_product_id" uuid,
	"e_coli_stellar_volume" double precision DEFAULT 20,
	"transformed_on" timestamp,
	"transformed_by" uuid,
	"colony_picked_on" timestamp,
	"colony_picked_by" uuid,
	"prepped_on" timestamp,
	"prepped_by" uuid,
	"notes" text,
	CONSTRAINT "ha_puc19_plasmids_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "homology_arm_puc19_primers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"homology_arm_primer_id" uuid,
	"name" varchar(255) NOT NULL,
	"sequence" varchar(255),
	"notes" text,
	CONSTRAINT "sequence_check" CHECK ("homology_arm_puc19_primers"."sequence" ~* '^[actg]*$')
);
--> statement-breakpoint
ALTER TABLE "ha_pcr_products" ADD CONSTRAINT "ha_pcr_products_ha_cloning_experiment_id_ha_cloning_experiments_id_fk" FOREIGN KEY ("ha_cloning_experiment_id") REFERENCES "public"."ha_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_pcr_products" ADD CONSTRAINT "ha_pcr_products_ha_primer_forward_homology_arm_primers_id_fk" FOREIGN KEY ("ha_primer_forward") REFERENCES "public"."homology_arm_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_pcr_products" ADD CONSTRAINT "ha_pcr_products_ha_primer_reverse_homology_arm_primers_id_fk" FOREIGN KEY ("ha_primer_reverse") REFERENCES "public"."homology_arm_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_pcr_products" ADD CONSTRAINT "ha_pcr_products_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_gibson_products" ADD CONSTRAINT "ha_puc19_gibson_products_ha_pcr_product_id_ha_pcr_products_id_fk" FOREIGN KEY ("ha_pcr_product_id") REFERENCES "public"."ha_pcr_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_gibson_products" ADD CONSTRAINT "ha_puc19_gibson_products_prepped_by_users_id_fk" FOREIGN KEY ("prepped_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" ADD CONSTRAINT "ha_puc19_pcr_products_ha_pcr_product_id_ha_pcr_products_id_fk" FOREIGN KEY ("ha_pcr_product_id") REFERENCES "public"."ha_pcr_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" ADD CONSTRAINT "ha_puc19_pcr_products_ha_puc19_primer_forward_homology_arm_puc19_primers_id_fk" FOREIGN KEY ("ha_puc19_primer_forward") REFERENCES "public"."homology_arm_puc19_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" ADD CONSTRAINT "ha_puc19_pcr_products_ha_puc19_primer_reverse_homology_arm_puc19_primers_id_fk" FOREIGN KEY ("ha_puc19_primer_reverse") REFERENCES "public"."homology_arm_puc19_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" ADD CONSTRAINT "ha_puc19_pcr_products_cleaned_by_users_id_fk" FOREIGN KEY ("cleaned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_cloning_experiment_targets" ADD CONSTRAINT "ha_cloning_experiment_targets_ha_cloning_experiment_id_ha_cloning_experiments_id_fk" FOREIGN KEY ("ha_cloning_experiment_id") REFERENCES "public"."ha_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_cloning_experiment_targets" ADD CONSTRAINT "ha_cloning_experiment_targets_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_plasmids" ADD CONSTRAINT "ha_puc19_plasmids_ha_puc19_gibson_product_id_ha_puc19_gibson_products_id_fk" FOREIGN KEY ("ha_puc19_gibson_product_id") REFERENCES "public"."ha_puc19_gibson_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_plasmids" ADD CONSTRAINT "ha_puc19_plasmids_transformed_by_users_id_fk" FOREIGN KEY ("transformed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_plasmids" ADD CONSTRAINT "ha_puc19_plasmids_colony_picked_by_users_id_fk" FOREIGN KEY ("colony_picked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_plasmids" ADD CONSTRAINT "ha_puc19_plasmids_prepped_by_users_id_fk" FOREIGN KEY ("prepped_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homology_arm_puc19_primers" ADD CONSTRAINT "homology_arm_puc19_primers_homology_arm_primer_id_homology_arm_primers_id_fk" FOREIGN KEY ("homology_arm_primer_id") REFERENCES "public"."homology_arm_primers"("id") ON DELETE no action ON UPDATE no action;