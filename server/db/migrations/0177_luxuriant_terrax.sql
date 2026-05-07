ALTER TABLE "nucleic_acids" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "nucleic_acids" CASCADE;--> statement-breakpoint
ALTER TABLE "wellables" DROP CONSTRAINT "wellable_table_name";--> statement-breakpoint
ALTER TABLE "wellables" ADD CONSTRAINT "wellable_table_name" CHECK ("wellables"."table_name" IN (
      'amplification_primers',
      'linearization_primers',
      'homology_arm_primers',
      'homology_arm_puc19_primers',
      'preseq_1_primers',
      'preseq_2_primers',
      'index_primers',
      'dna',
      'rna',
      'pellets',
      'sg_rna_plasmids',
      'snv_lib_plasmids',
      'sg_rna_oligos',
      'external_samples',
      'ha_pcr_products',
      'ha_puc19_pcr_products',
      'ha_puc19_gibson_products',
      'ha_puc19_plasmids',
      'snv_lib_amp_products',
      'snv_lib_lin_products',
      'snv_lib_gibson_products',
      'snv_lib_plasmids',
      'snv_lib_clonal_dna_products',
      'snv_lib_golden_gate_products',
      'clonal_has'
    ));