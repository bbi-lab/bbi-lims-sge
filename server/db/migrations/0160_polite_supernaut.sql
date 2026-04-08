ALTER TABLE "regions" DROP CONSTRAINT "unique_target_name_gene";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_region_name_gene_id" ON "regions" USING btree (lower(trim("name")),"gene_id");