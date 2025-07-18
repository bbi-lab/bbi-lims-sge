CREATE TABLE "sequencing_run_external_samples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequencing_run_id" uuid NOT NULL,
	"external_sample_id" varchar(255) NOT NULL,
	"custom_index_seq_1" varchar(50) NOT NULL,
	"custom_index_seq_2" varchar(50) NOT NULL,
	"million_reads_required" integer,
	"override_cycles" varchar(10)[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sequencing_run_external_samples" ADD CONSTRAINT "sequencing_run_external_samples_sequencing_run_id_sequencing_runs_id_fk" FOREIGN KEY ("sequencing_run_id") REFERENCES "public"."sequencing_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_custom_index_seqs_per_sequencing_run" ON "sequencing_run_external_samples" USING btree ("sequencing_run_id",least("custom_index_seq_1", "custom_index_seq_2"),greatest("custom_index_seq_1", "custom_index_seq_2"));