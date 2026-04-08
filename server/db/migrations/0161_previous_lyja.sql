CREATE TABLE "sg_rna_plasmid_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sg_rna_plasmid_id" uuid NOT NULL,
	"target_id" uuid NOT NULL
);
--> statement-breakpoint
INSERT INTO "sg_rna_plasmid_targets" ("sg_rna_plasmid_id", "target_id") SELECT id, target_id FROM "sg_rna_plasmids" WHERE target_id IS NOT NULL;--> statement-breakpoint
ALTER TABLE "sg_rna_plasmids" DROP CONSTRAINT "sg_rna_plasmids_target_id_targets_id_fk";
--> statement-breakpoint
ALTER TABLE "sg_rna_plasmid_targets" ADD CONSTRAINT "sg_rna_plasmid_targets_sg_rna_plasmid_id_sg_rna_plasmids_id_fk" FOREIGN KEY ("sg_rna_plasmid_id") REFERENCES "public"."sg_rna_plasmids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sg_rna_plasmid_targets" ADD CONSTRAINT "sg_rna_plasmid_targets_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sg_rna_plasmids" DROP COLUMN "target_id";
