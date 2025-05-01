ALTER TABLE "nucleic_acids" DROP CONSTRAINT "nucleic_acids_storage_box_id_storage_boxes_id_fk";
--> statement-breakpoint
ALTER TABLE "pellets" DROP CONSTRAINT "pellets_storage_box_id_storage_boxes_id_fk";
--> statement-breakpoint
ALTER TABLE "plasmids" DROP CONSTRAINT "plasmids_storage_box_id_storage_boxes_id_fk";
--> statement-breakpoint
ALTER TABLE "amplification_primers" DROP CONSTRAINT "amplification_primers_storage_box_id_storage_boxes_id_fk";
--> statement-breakpoint
ALTER TABLE "homology_arm_primers" DROP CONSTRAINT "homology_arm_primers_storage_box_id_storage_boxes_id_fk";
--> statement-breakpoint
ALTER TABLE "linearization_primers" DROP CONSTRAINT "linearization_primers_storage_box_id_storage_boxes_id_fk";
--> statement-breakpoint
ALTER TABLE "nucleic_acids" DROP COLUMN "storage_box_id";--> statement-breakpoint
ALTER TABLE "nucleic_acids" DROP COLUMN "storage_box_loc";--> statement-breakpoint
ALTER TABLE "pellets" DROP COLUMN "storage_box_id";--> statement-breakpoint
ALTER TABLE "pellets" DROP COLUMN "storage_box_loc";--> statement-breakpoint
ALTER TABLE "plasmids" DROP COLUMN "storage_box_id";--> statement-breakpoint
ALTER TABLE "plasmids" DROP COLUMN "storage_box_loc";--> statement-breakpoint
ALTER TABLE "amplification_primers" DROP COLUMN "storage_box_id";--> statement-breakpoint
ALTER TABLE "amplification_primers" DROP COLUMN "storage_box_loc";--> statement-breakpoint
ALTER TABLE "homology_arm_primers" DROP COLUMN "storage_box_id";--> statement-breakpoint
ALTER TABLE "homology_arm_primers" DROP COLUMN "storage_box_loc";--> statement-breakpoint
ALTER TABLE "linearization_primers" DROP COLUMN "storage_box_id";--> statement-breakpoint
ALTER TABLE "linearization_primers" DROP COLUMN "storage_box_loc";