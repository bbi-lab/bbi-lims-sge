CREATE TABLE "homology_arm_primer_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"homology_arm_primer_id" uuid NOT NULL,
	"target_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "homology_arm_primers" DROP CONSTRAINT "homology_arm_primers_target_id_targets_id_fk";
--> statement-breakpoint
ALTER TABLE "homology_arm_puc19_primers" ALTER COLUMN "homology_arm_primer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "homology_arm_primer_targets" ADD CONSTRAINT "homology_arm_primer_targets_homology_arm_primer_id_homology_arm_primers_id_fk" FOREIGN KEY ("homology_arm_primer_id") REFERENCES "public"."homology_arm_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homology_arm_primer_targets" ADD CONSTRAINT "homology_arm_primer_targets_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_ha_primer_target" ON "homology_arm_primer_targets" USING btree ("homology_arm_primer_id","target_id");--> statement-breakpoint
ALTER TABLE "homology_arm_primers" DROP COLUMN "target_id";--> statement-breakpoint
ALTER TABLE "homology_arm_puc19_primers" DROP COLUMN "sequence_type";--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ADD CONSTRAINT "homology_arm_primers_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "homology_arm_puc19_primers" ADD CONSTRAINT "homology_arm_puc19_primers_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "index_primers" ADD CONSTRAINT "index_primers_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "linearization_primers" ADD CONSTRAINT "linearization_primers_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "preseq_1_primers" ADD CONSTRAINT "preseq_1_primers_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "preseq_2_primers" ADD CONSTRAINT "preseq_2_primers_name_unique" UNIQUE("name");