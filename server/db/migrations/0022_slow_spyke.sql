ALTER TABLE "amplification_primers" DROP CONSTRAINT "amplification_primers_well_id_wells_id_fk";
--> statement-breakpoint
ALTER TABLE "homology_arm_primers" DROP CONSTRAINT "homology_arm_primers_well_id_wells_id_fk";
--> statement-breakpoint
ALTER TABLE "linearization_primers" DROP CONSTRAINT "linearization_primers_well_id_wells_id_fk";
--> statement-breakpoint
ALTER TABLE "wells" ADD COLUMN "amplification_primer_id" uuid;--> statement-breakpoint
ALTER TABLE "wells" ADD COLUMN "linearization_primer_id" uuid;--> statement-breakpoint
ALTER TABLE "wells" ADD COLUMN "homology_arm_primer_id" uuid;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_amplification_primer_id_amplification_primers_id_fk" FOREIGN KEY ("amplification_primer_id") REFERENCES "public"."amplification_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_linearization_primer_id_linearization_primers_id_fk" FOREIGN KEY ("linearization_primer_id") REFERENCES "public"."linearization_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_homology_arm_primer_id_homology_arm_primers_id_fk" FOREIGN KEY ("homology_arm_primer_id") REFERENCES "public"."homology_arm_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "amplification_primers" DROP COLUMN "well_id";--> statement-breakpoint
ALTER TABLE "homology_arm_primers" DROP COLUMN "well_id";--> statement-breakpoint
ALTER TABLE "linearization_primers" DROP COLUMN "well_id";