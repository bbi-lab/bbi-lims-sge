ALTER TABLE "snv_lib_golden_gate_products" DROP CONSTRAINT "snv_lib_golden_gate_products_snv_lib_clonal_dna_product_id_unique";--> statement-breakpoint
ALTER TABLE "snv_lib_golden_gate_products" DROP CONSTRAINT "snv_lib_golden_gate_products_snv_lib_clonal_dna_product_id_snv_lib_clonal_dna_products_id_fk";
--> statement-breakpoint
ALTER TABLE "snv_lib_golden_gate_products" ADD COLUMN "clonal_ha_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "snv_lib_golden_gate_products" ADD CONSTRAINT "snv_lib_golden_gate_products_clonal_ha_id_clonal_has_id_fk" FOREIGN KEY ("clonal_ha_id") REFERENCES "public"."clonal_has"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_golden_gate_products" DROP COLUMN "snv_lib_clonal_dna_product_id";--> statement-breakpoint
ALTER TABLE "snv_lib_golden_gate_products" ADD CONSTRAINT "snv_lib_golden_gate_products_clonal_ha_id_unique" UNIQUE("clonal_ha_id");