ALTER TABLE "amplification_primers" ADD COLUMN "target_id" uuid;--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ADD COLUMN "target_id" uuid;--> statement-breakpoint
ALTER TABLE "linearization_primers" ADD COLUMN "target_id" uuid;--> statement-breakpoint
ALTER TABLE "amplification_primers" ADD CONSTRAINT "amplification_primers_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ADD CONSTRAINT "homology_arm_primers_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linearization_primers" ADD CONSTRAINT "linearization_primers_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;