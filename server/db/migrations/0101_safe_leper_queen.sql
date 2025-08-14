DROP VIEW "public"."view_plates_with_well_counts";--> statement-breakpoint
ALTER TABLE "pcr_1_primers" RENAME TO "preseq_1_primers";--> statement-breakpoint
ALTER TABLE "pcr_2_primers" RENAME TO "preseq_2_primers";--> statement-breakpoint
ALTER TABLE "preseq_1_primers" DROP CONSTRAINT "sequence_check";--> statement-breakpoint
ALTER TABLE "preseq_2_primers" DROP CONSTRAINT "sequence_check";--> statement-breakpoint
ALTER TABLE "preseq_2_primers" DROP CONSTRAINT "adapter_sequence_check";--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "one_item_per_well_content";--> statement-breakpoint
ALTER TABLE "preseq_1_primers" DROP CONSTRAINT "pcr_1_primers_target_id_targets_id_fk";
--> statement-breakpoint
ALTER TABLE "preseq_2_primers" DROP CONSTRAINT "pcr_2_primers_target_id_targets_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_pcr_1_primer_id_pcr_1_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "well_contents_pcr_2_primer_id_pcr_2_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "well_contents" ADD COLUMN "preseq_1_primer_id" uuid;--> statement-breakpoint
ALTER TABLE "well_contents" ADD COLUMN "preseq_2_primer_id" uuid;--> statement-breakpoint
ALTER TABLE "preseq_1_primers" ADD CONSTRAINT "preseq_1_primers_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preseq_2_primers" ADD CONSTRAINT "preseq_2_primers_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_preseq_1_primer_id_preseq_1_primers_id_fk" FOREIGN KEY ("preseq_1_primer_id") REFERENCES "public"."preseq_1_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_preseq_2_primer_id_preseq_2_primers_id_fk" FOREIGN KEY ("preseq_2_primer_id") REFERENCES "public"."preseq_2_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "pcr_1_primer_id";--> statement-breakpoint
ALTER TABLE "well_contents" DROP COLUMN "pcr_2_primer_id";--> statement-breakpoint
ALTER TABLE "preseq_1_primers" ADD CONSTRAINT "sequence_check" CHECK ("preseq_1_primers"."sequence" ~* '^[actg]*$');--> statement-breakpoint
ALTER TABLE "preseq_2_primers" ADD CONSTRAINT "sequence_check" CHECK ("preseq_2_primers"."sequence" ~* '^[actg]*$');--> statement-breakpoint
ALTER TABLE "preseq_2_primers" ADD CONSTRAINT "adapter_sequence_check" CHECK ("preseq_2_primers"."adapter_sequence" ~* '^[actg]*$');--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "one_item_per_well_content" CHECK (num_nonnulls("well_contents"."amplification_primer_id", "well_contents"."linearization_primer_id", "well_contents"."homology_arm_primer_id", "well_contents"."preseq_1_primer_id", "well_contents"."preseq_2_primer_id", "well_contents"."index_primer_id", "well_contents"."nucleic_acid_id", "well_contents"."pellet_id", "well_contents"."sg_rna_plasmid_id", "well_contents"."snv_lib_plasmid_id", "well_contents"."oligo_id") = 1);--> statement-breakpoint
CREATE VIEW "public"."view_plates_with_well_counts" AS (with plate_types(plate_type_value, plate_type_label, plate_type_desc) AS (VALUES ('pellet-storage', 'Pellet storage', 'Pellet storage'), ('lin-storage', 'LIN primer storage', 'Linearization primer storage'), ('amp-storage', 'AMP primer storage', 'Amplification primer storage'), ('ha-storage', 'HA primer storage', 'Homology arm primer storage'), ('guide-rna-storage', 'sgRNA oligo storage', 'sgRNA oligo storage'), ('guide-rna', 'sgRNA oligo', 'sgRNA oligo'), ('sg-rna-plasmid', 'sgRNA plasmid', 'sgRNA plasmid'), ('lin-pcr', 'LIN PCR', 'Linearization primer PCR'), ('amp-pcr', 'AMP PCR', 'Amplification primer PCR'), ('ha-pcr', 'HA PCR', 'Homology arm primer PCR'), ('preseq-1', 'PreSeq 1', 'PreSeq 1'), ('preseq-2', 'PreSeq 2', 'PreSeq 2'), ('preseq-3', 'PreSeq 3', 'PreSeq 3'), ('snv-lib-preseq-2', 'SNV-lib PreSeq 2', 'SNV-lib PreSeq 2'), ('snv-lib-preseq-3', 'SNV-lib PreSeq 3', 'SNV-lib PreSeq 3'), ('seq-index', 'Seq index', 'Sequencing index plate'), ('pcr1-primer-storage', 'PreSeq 1 primer storage', 'PreSeq 1 primer storage'), ('pcr2-primer-storage', 'PreSeq 2 primer storage', 'PreSeq 2 primer storage')) select
    "plates"."id",
    "plates"."pcr_experiment_id",
    "plates"."sg_rna_cloning_experiment_id",
    "plates"."snv_lib_cloning_experiment_id",
    "plates"."name",
    "plates"."size_x",
    "plates"."size_y",
    "plates"."plate_type",
    "plates"."discarded",
    "plates"."processed",
    "cycles"."id" as cycle_id,
    "cycles"."name" as cycle_name,
    string_agg(distinct "targets"."name", ',') as targets,
    (select distinct on (plate_type_value) plate_type_label from plate_types where plate_type_value = "plates"."plate_type") as plate_type_label,
    count(distinct("wells"."id")) as wells_count,
    count(distinct("well_contents"."well_id")) as wells_with_content_count,
    count(distinct("well_content_sources"."source_well_id")) as wells_processed_count
    from "plates"
    join "wells" on "plates"."id" = "wells"."plate_id"
    left join "well_content_sources" on "wells"."id" = "well_content_sources"."source_well_id"
    left join "well_contents" on "wells"."id" = "well_contents"."well_id"
    left join "pcr_experiments" on "plates"."pcr_experiment_id" = "pcr_experiments"."id"
    left join "transfect_targets" on "pcr_experiments"."transfect_target_id" = "transfect_targets"."id"
    left join "targets" on "targets"."id" = "transfect_targets"."target_id"
    left join "transfect_experiments" on "transfect_targets"."experiment_id" = "transfect_experiments"."id"
    left join "cycles" on "transfect_experiments"."cycle_id" = "cycles"."id"
    group by "plates"."id", "cycles"."id");