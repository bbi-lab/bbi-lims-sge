ALTER TABLE "ha_pcr_products" RENAME COLUMN "ha_primer_forward" TO "ha_primer_forward_id";--> statement-breakpoint
ALTER TABLE "ha_pcr_products" RENAME COLUMN "ha_primer_reverse" TO "ha_primer_reverse_id";--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" RENAME COLUMN "ha_puc19_primer_forward" TO "ha_puc19_primer_forward_id";--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" RENAME COLUMN "ha_puc19_primer_reverse" TO "ha_puc19_primer_reverse_id";--> statement-breakpoint
ALTER TABLE "ha_pcr_products" DROP CONSTRAINT "ha_pcr_products_ha_primer_forward_homology_arm_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "ha_pcr_products" DROP CONSTRAINT "ha_pcr_products_ha_primer_reverse_homology_arm_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" DROP CONSTRAINT "ha_puc19_pcr_products_ha_puc19_primer_forward_homology_arm_puc19_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" DROP CONSTRAINT "ha_puc19_pcr_products_ha_puc19_primer_reverse_homology_arm_puc19_primers_id_fk";
--> statement-breakpoint
ALTER TABLE "ha_pcr_products" ADD CONSTRAINT "ha_pcr_products_ha_primer_forward_id_homology_arm_primers_id_fk" FOREIGN KEY ("ha_primer_forward_id") REFERENCES "public"."homology_arm_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_pcr_products" ADD CONSTRAINT "ha_pcr_products_ha_primer_reverse_id_homology_arm_primers_id_fk" FOREIGN KEY ("ha_primer_reverse_id") REFERENCES "public"."homology_arm_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" ADD CONSTRAINT "ha_puc19_pcr_products_ha_puc19_primer_forward_id_homology_arm_puc19_primers_id_fk" FOREIGN KEY ("ha_puc19_primer_forward_id") REFERENCES "public"."homology_arm_puc19_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_puc19_pcr_products" ADD CONSTRAINT "ha_puc19_pcr_products_ha_puc19_primer_reverse_id_homology_arm_puc19_primers_id_fk" FOREIGN KEY ("ha_puc19_primer_reverse_id") REFERENCES "public"."homology_arm_puc19_primers"("id") ON DELETE no action ON UPDATE no action;