ALTER TABLE "sequencing_run_external_samples" ALTER COLUMN "sequencing_run_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ALTER COLUMN "custom_index_seq_2" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ADD COLUMN "project_name" varchar(255);