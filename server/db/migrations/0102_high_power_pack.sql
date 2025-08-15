ALTER TABLE "oligos" RENAME TO "sg_rna_oligos";--> statement-breakpoint
ALTER TABLE "sg_rna_oligos" DROP CONSTRAINT "oligos_name_unique";--> statement-breakpoint
ALTER TABLE "sg_rna_oligos" DROP CONSTRAINT "sequence_check";--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "one_item_per_well_content";--> statement-breakpoint
ALTER TABLE "sg_rna_oligos" DROP CONSTRAINT "oligos_target_id_targets_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_oligo_id_oligos_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" ADD COLUMN "sg_rna_oligo_id" uuid;--> statement-breakpoint
ALTER TABLE "sg_rna_oligos" ADD CONSTRAINT "sg_rna_oligos_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_sg_rna_oligo_id_sg_rna_oligos_id_fk" FOREIGN KEY ("sg_rna_oligo_id") REFERENCES "public"."sg_rna_oligos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sg_rna_oligos" DROP COLUMN "oligo_type";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "oligo_id";--> statement-breakpoint
ALTER TABLE "sg_rna_oligos" ADD CONSTRAINT "sg_rna_oligos_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "sg_rna_oligos" ADD CONSTRAINT "sequence_check" CHECK ("sg_rna_oligos"."sequence" ~* '^[actg]*$');--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "one_item_per_well_content" CHECK (num_nonnulls("well_contents"."amplification_primer_id", "well_contents"."linearization_primer_id", "well_contents"."homology_arm_primer_id", "well_contents"."preseq_1_primer_id", "well_contents"."preseq_2_primer_id", "well_contents"."index_primer_id", "well_contents"."nucleic_acid_id", "well_contents"."pellet_id", "well_contents"."sg_rna_plasmid_id", "well_contents"."snv_lib_plasmid_id", "well_contents"."sg_rna_oligo_id") = 1);