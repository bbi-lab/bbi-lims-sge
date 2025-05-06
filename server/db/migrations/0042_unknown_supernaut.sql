ALTER TABLE "storage_boxes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "storage_boxes" CASCADE;--> statement-breakpoint
ALTER TABLE "wells" DROP CONSTRAINT "wells_amplification_primer_id_unique";--> statement-breakpoint
ALTER TABLE "wells" DROP CONSTRAINT "wells_linearization_primer_id_unique";--> statement-breakpoint
ALTER TABLE "wells" DROP CONSTRAINT "wells_homology_arm_primer_id_unique";--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "one_item_per_well_content";--> statement-breakpoint
ALTER TABLE "wells" DROP CONSTRAINT "one_item_per_well";--> statement-breakpoint
ALTER TABLE "wells" DROP CONSTRAINT "wells_amplification_primer_id_amplification_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "wells" DROP CONSTRAINT "wells_linearization_primer_id_linearization_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "wells" DROP CONSTRAINT "wells_homology_arm_primer_id_homology_arm_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" ADD COLUMN "pellet_id" uuid;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_pellet_id_pellets_id_fk" FOREIGN KEY ("pellet_id") REFERENCES "public"."pellets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" DROP COLUMN "amplification_primer_id";--> statement-breakpoint
ALTER TABLE "wells" DROP COLUMN "linearization_primer_id";--> statement-breakpoint
ALTER TABLE "wells" DROP COLUMN "homology_arm_primer_id";--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_pellet_id_unique" UNIQUE("pellet_id");--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "one_item_per_well_content" CHECK (num_nonnulls("well_contents"."amplification_primer_id", "well_contents"."linearization_primer_id", "well_contents"."homology_arm_primer_id", "well_contents"."nucleic_acid_id", "well_contents"."pellet_id") = 1);