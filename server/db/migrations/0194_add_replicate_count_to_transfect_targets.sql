ALTER TABLE "transfect_targets" ADD COLUMN "replicate_count" integer;--> statement-breakpoint
UPDATE "transfect_targets" AS t SET "replicate_count" = e."replicates_count" FROM "transfect_experiments" AS e WHERE t."experiment_id" = e."id";--> statement-breakpoint
ALTER TABLE "transfect_targets" ALTER COLUMN "replicate_count" SET NOT NULL;
