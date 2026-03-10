CREATE TABLE "pcr_experiment_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pcr_experiment_id" uuid NOT NULL,
	"transfect_target_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pcr_experiment_targets" ADD CONSTRAINT "pcr_experiment_targets_pcr_experiment_id_pcr_experiments_id_fk" FOREIGN KEY ("pcr_experiment_id") REFERENCES "public"."pcr_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pcr_experiment_targets" ADD CONSTRAINT "pcr_experiment_targets_transfect_target_id_transfect_targets_id_fk" FOREIGN KEY ("transfect_target_id") REFERENCES "public"."transfect_targets"("id") ON DELETE no action ON UPDATE no action;