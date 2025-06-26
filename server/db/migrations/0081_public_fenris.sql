CREATE TABLE "sequencing_run_samples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequencing_run_id" uuid NOT NULL,
	"nucleic_acid_id" uuid NOT NULL,
	"index_primer_1_id" uuid NOT NULL,
	"index_primer_2_id" uuid NOT NULL,
	"source_well_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ADD CONSTRAINT "sequencing_run_samples_sequencing_run_id_sequencing_runs_id_fk" FOREIGN KEY ("sequencing_run_id") REFERENCES "public"."sequencing_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ADD CONSTRAINT "sequencing_run_samples_nucleic_acid_id_nucleic_acids_id_fk" FOREIGN KEY ("nucleic_acid_id") REFERENCES "public"."nucleic_acids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ADD CONSTRAINT "sequencing_run_samples_index_primer_1_id_index_primers_id_fk" FOREIGN KEY ("index_primer_1_id") REFERENCES "public"."index_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ADD CONSTRAINT "sequencing_run_samples_index_primer_2_id_index_primers_id_fk" FOREIGN KEY ("index_primer_2_id") REFERENCES "public"."index_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequencing_run_samples" ADD CONSTRAINT "sequencing_run_samples_source_well_id_wells_id_fk" FOREIGN KEY ("source_well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;