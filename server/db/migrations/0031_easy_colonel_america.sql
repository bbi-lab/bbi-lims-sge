CREATE TABLE "well_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"well_id" uuid NOT NULL,
	"amplification_primer_id" uuid,
	"linearization_primer_id" uuid,
	"homology_arm_primer_id" uuid,
	"nucleic_acid_id" uuid,
	CONSTRAINT "one_item_per_well_content" CHECK (num_nonnulls("well_contents"."amplification_primer_id", "well_contents"."linearization_primer_id", "well_contents"."homology_arm_primer_id", ) <= 1)
);
--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_well_id_wells_id_fk" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_amplification_primer_id_amplification_primers_id_fk" FOREIGN KEY ("amplification_primer_id") REFERENCES "public"."amplification_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_linearization_primer_id_linearization_primers_id_fk" FOREIGN KEY ("linearization_primer_id") REFERENCES "public"."linearization_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_homology_arm_primer_id_homology_arm_primers_id_fk" FOREIGN KEY ("homology_arm_primer_id") REFERENCES "public"."homology_arm_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_nucleic_acid_id_nucleic_acids_id_fk" FOREIGN KEY ("nucleic_acid_id") REFERENCES "public"."nucleic_acids"("id") ON DELETE no action ON UPDATE no action;