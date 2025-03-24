ALTER TABLE "wells" DROP CONSTRAINT "wells_plate_id_x_y_pk";--> statement-breakpoint
ALTER TABLE "amplification_primers" ADD COLUMN "storage_box_id" uuid;--> statement-breakpoint
ALTER TABLE "amplification_primers" ADD COLUMN "storage_box_loc" varchar;--> statement-breakpoint
ALTER TABLE "amplification_primers" ADD COLUMN "well_id" uuid;--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ADD COLUMN "storage_box_id" uuid;--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ADD COLUMN "storage_box_loc" varchar;--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ADD COLUMN "well_id" uuid;--> statement-breakpoint
ALTER TABLE "linearization_primers" ADD COLUMN "storage_box_id" uuid;--> statement-breakpoint
ALTER TABLE "linearization_primers" ADD COLUMN "storage_box_loc" varchar;--> statement-breakpoint
ALTER TABLE "linearization_primers" ADD COLUMN "well_id" uuid;--> statement-breakpoint
ALTER TABLE "wells" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "amplification_primers" ADD CONSTRAINT "amplification_primers_storage_box_id_storage_boxes_id_fk" FOREIGN KEY ("storage_box_id") REFERENCES "public"."storage_boxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "amplification_primers" ADD CONSTRAINT "amplification_primers_well_id_wells_id_fk" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ADD CONSTRAINT "homology_arm_primers_storage_box_id_storage_boxes_id_fk" FOREIGN KEY ("storage_box_id") REFERENCES "public"."storage_boxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ADD CONSTRAINT "homology_arm_primers_well_id_wells_id_fk" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linearization_primers" ADD CONSTRAINT "linearization_primers_storage_box_id_storage_boxes_id_fk" FOREIGN KEY ("storage_box_id") REFERENCES "public"."storage_boxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linearization_primers" ADD CONSTRAINT "linearization_primers_well_id_wells_id_fk" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "unique_coord" UNIQUE("x","y");