ALTER TABLE "amplification_primers" ADD COLUMN "ordered_on" timestamp;--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ADD COLUMN "ordered_on" timestamp;--> statement-breakpoint
ALTER TABLE "homology_arm_puc19_primers" ADD COLUMN "ordered_on" timestamp;--> statement-breakpoint
ALTER TABLE "linearization_primers" ADD COLUMN "ordered_on" timestamp;--> statement-breakpoint
ALTER TABLE "preseq_1_primers" ADD COLUMN "ordered_on" timestamp;--> statement-breakpoint
ALTER TABLE "preseq_2_primers" ADD COLUMN "ordered_on" timestamp;