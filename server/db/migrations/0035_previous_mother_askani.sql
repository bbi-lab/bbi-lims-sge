ALTER TABLE "pellets" DROP CONSTRAINT "pellets_extraction_experiment_id_extraction_experiments_id_fk";
--> statement-breakpoint
ALTER TABLE "pellets" DROP COLUMN "extraction_experiment_id";