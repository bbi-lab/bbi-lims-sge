ALTER TABLE "ha_puc19_gibson_products" RENAME COLUMN "ha_pcr_product_id" TO "ha_puc19_pcr_product_id";--> statement-breakpoint
ALTER TABLE "wellables" DROP CONSTRAINT "wellable_table_name";--> statement-breakpoint
ALTER TABLE "ha_puc19_gibson_products" DROP CONSTRAINT "ha_puc19_gibson_products_ha_pcr_product_id_ha_pcr_products_id_fk";
--> statement-breakpoint
ALTER TABLE "ha_pcr_products" ALTER COLUMN "ha_primer_forward_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ha_pcr_products" ALTER COLUMN "ha_primer_reverse_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" ALTER COLUMN "ha_pcr_product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" ALTER COLUMN "ha_puc19_primer_forward_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" ALTER COLUMN "ha_puc19_primer_reverse_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ha_puc19_gibson_products" ADD CONSTRAINT "ha_puc19_gibson_products_ha_puc19_pcr_product_id_ha_puc19_pcr_products_id_fk" FOREIGN KEY ("ha_puc19_pcr_product_id") REFERENCES "public"."ha_puc19_pcr_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellables" ADD CONSTRAINT "wellable_table_name" CHECK ("wellables"."table_name" IN (
      'amplification_primers',
      'linearization_primers',
      'homology_arm_primers',
      'homology_arm_puc19_primers',
      'preseq_1_primers',
      'preseq_2_primers',
      'index_primers',
      'nucleic_acids',
      'pellets',
      'sg_rna_plasmids',
      'snv_lib_plasmids',
      'sg_rna_oligos',
      'external_samples',
      'ha_pcr_products',
      'ha_puc19_pcr_products',
      'ha_puc19_gibson_products',
      'ha_puc19_plasmids'
    ));