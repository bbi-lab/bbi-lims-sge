ALTER TABLE "amplification_primers" ALTER COLUMN "sequence_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ALTER COLUMN "sequence_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ALTER COLUMN "cloning_strategy" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "linearization_primers" ALTER COLUMN "sequence_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "amplification_primers" ADD CONSTRAINT "sequence_check" CHECK ("amplification_primers"."sequence" ~* '^[actg]+$');--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ADD CONSTRAINT "sequence_check" CHECK ("homology_arm_primers"."sequence" ~* '^[actg]+$');--> statement-breakpoint
ALTER TABLE "linearization_primers" ADD CONSTRAINT "sequence_check" CHECK ("linearization_primers"."sequence" ~* '^[actg]+$');