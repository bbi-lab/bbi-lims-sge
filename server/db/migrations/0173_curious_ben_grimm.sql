ALTER TABLE "amplification_primers" ADD COLUMN "archived" boolean;--> statement-breakpoint
ALTER TABLE "homology_arm_primers" ADD COLUMN "archived" boolean;--> statement-breakpoint
ALTER TABLE "homology_arm_puc19_primers" ADD COLUMN "archived" boolean;--> statement-breakpoint
ALTER TABLE "linearization_primers" ADD COLUMN "archived" boolean;--> statement-breakpoint
ALTER TABLE "preseq_1_primers" ADD COLUMN "archived" boolean;--> statement-breakpoint
ALTER TABLE "preseq_2_primers" ADD COLUMN "archived" boolean;--> statement-breakpoint
ALTER TABLE "rna_preseq_1_primers" ADD COLUMN "archived" boolean;--> statement-breakpoint
ALTER TABLE "rna_preseq_2_primers" ADD COLUMN "archived" boolean;--> statement-breakpoint
ALTER TABLE "rna_rt_primers" ADD COLUMN "archived" boolean;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_amp_primer_target_seq_type_active" ON "amplification_primers" USING btree ("target_id","sequence_type") WHERE archived IS NOT TRUE;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_ha_puc19_primer_active" ON "homology_arm_puc19_primers" USING btree ("homology_arm_primer_id") WHERE archived IS NOT TRUE;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_lin_primer_target_seq_type_active" ON "linearization_primers" USING btree ("target_id","sequence_type") WHERE archived IS NOT TRUE;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_preseq2_primer_target_seq_type_active" ON "preseq_2_primers" USING btree ("target_id","sequence_type") WHERE archived IS NOT TRUE;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_rna_rt_primer_gene_seq_type_active" ON "rna_rt_primers" USING btree ("gene_id","sequence_type") WHERE archived IS NOT TRUE;