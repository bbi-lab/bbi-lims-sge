ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_amplification_primer_id_unique";--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_linearization_primer_id_unique";--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_homology_arm_primer_id_unique";--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_pellet_id_unique";--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "one_item_per_well_content";--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_amplification_primer_id_amplification_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_linearization_primer_id_linearization_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_homology_arm_primer_id_homology_arm_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_preseq_1_primer_id_preseq_1_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_preseq_2_primer_id_preseq_2_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_index_primer_id_index_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_nucleic_acid_id_nucleic_acids_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_pellet_id_pellets_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_sg_rna_plasmid_id_sg_rna_plasmids_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_snv_lib_plasmid_id_snv_lib_plasmids_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_sg_rna_oligo_id_sg_rna_oligos_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_external_sample_id_external_samples_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" ALTER COLUMN "wellable_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "amplification_primer_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "linearization_primer_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "homology_arm_primer_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "preseq_1_primer_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "preseq_2_primer_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "index_primer_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "nucleic_acid_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "pellet_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "sg_rna_plasmid_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "snv_lib_plasmid_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "sg_rna_oligo_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "external_sample_id";