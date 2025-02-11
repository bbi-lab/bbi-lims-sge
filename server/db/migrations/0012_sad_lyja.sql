CREATE TABLE "nucleic_acids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extraction_experiment_id" uuid,
	"storage_box_id" uuid,
	"storage_box_loc" varchar,
	"concentration" double precision,
	"pellet_id" uuid,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "plasmids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plasmid_type" varchar,
	"volume" double precision,
	"quant" double precision,
	"target_id" uuid NOT NULL,
	"plasmid_experiment_id" uuid,
	"storage_box_id" uuid,
	"storage_box_loc" varchar,
	"verification_status" varchar,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "nucleic_acids" ADD CONSTRAINT "nucleic_acids_extraction_experiment_id_extraction_experiments_id_fk" FOREIGN KEY ("extraction_experiment_id") REFERENCES "public"."extraction_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nucleic_acids" ADD CONSTRAINT "nucleic_acids_storage_box_id_storage_boxes_id_fk" FOREIGN KEY ("storage_box_id") REFERENCES "public"."storage_boxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nucleic_acids" ADD CONSTRAINT "nucleic_acids_pellet_id_pellets_id_fk" FOREIGN KEY ("pellet_id") REFERENCES "public"."pellets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plasmids" ADD CONSTRAINT "plasmids_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plasmids" ADD CONSTRAINT "plasmids_plasmid_experiment_id_plasmid_experiments_id_fk" FOREIGN KEY ("plasmid_experiment_id") REFERENCES "public"."plasmid_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plasmids" ADD CONSTRAINT "plasmids_storage_box_id_storage_boxes_id_fk" FOREIGN KEY ("storage_box_id") REFERENCES "public"."storage_boxes"("id") ON DELETE no action ON UPDATE no action;