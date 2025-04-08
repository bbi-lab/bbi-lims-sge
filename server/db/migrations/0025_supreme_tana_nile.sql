ALTER TABLE "wells" ADD CONSTRAINT "wells_amplification_primer_id_unique" UNIQUE("amplification_primer_id");--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_linearization_primer_id_unique" UNIQUE("linearization_primer_id");--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_homology_arm_primer_id_unique" UNIQUE("homology_arm_primer_id");