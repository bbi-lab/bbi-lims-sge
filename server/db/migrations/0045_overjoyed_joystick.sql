ALTER TABLE "transfect_experiments" ALTER COLUMN "replicates_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transfect_targets" ALTER COLUMN "transfection_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transfect_targets" ADD CONSTRAINT "unique_transfect_experiment_target_count" UNIQUE("experiment_id","target_id","transfection_count");