ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_amplification_primer_id_unique" UNIQUE("amplification_primer_id");--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_linearization_primer_id_unique" UNIQUE("linearization_primer_id");--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_homology_arm_primer_id_unique" UNIQUE("homology_arm_primer_id");--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_nucleic_acid_id_unique" UNIQUE("nucleic_acid_id");