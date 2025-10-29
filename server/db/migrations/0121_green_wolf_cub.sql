ALTER TABLE "ha_puc19_plasmids" ALTER COLUMN "ha_puc19_gibson_product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ha_puc19_gibson_products" ADD CONSTRAINT "ha_puc19_gibson_products_ha_puc19_pcr_product_id_unique" UNIQUE("ha_puc19_pcr_product_id");--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" ADD CONSTRAINT "ha_puc19_pcr_products_ha_pcr_product_id_unique" UNIQUE("ha_pcr_product_id");--> statement-breakpoint
ALTER TABLE "ha_puc19_plasmids" ADD CONSTRAINT "ha_puc19_plasmids_ha_puc19_gibson_product_id_unique" UNIQUE("ha_puc19_gibson_product_id");