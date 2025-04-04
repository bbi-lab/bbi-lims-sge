ALTER TABLE "wells" DROP CONSTRAINT "unique_coord";--> statement-breakpoint
ALTER TABLE "cycles" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "extraction_experiments" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "genes" ALTER COLUMN "ncbi_accession" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "genes" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "genes" ALTER COLUMN "symbol" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pcr_experiments" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transfect_experiments" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "extraction_experiments" ADD CONSTRAINT "extraction_experiments_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "lots" ADD CONSTRAINT "lots_lot_number_unique" UNIQUE("lot_number");--> statement-breakpoint
ALTER TABLE "pcr_experiments" ADD CONSTRAINT "pcr_experiments_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "plates" ADD CONSTRAINT "plates_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "unique_target_name_gene" UNIQUE("name","gene_id");--> statement-breakpoint
ALTER TABLE "storage_boxes" ADD CONSTRAINT "storage_boxes_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "transfect_experiments" ADD CONSTRAINT "transfect_experiments_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "transfect_targets" ADD CONSTRAINT "unique_transfect_experiment_target" UNIQUE("experiment_id","target_id");--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "unique_plate_coord" UNIQUE("plate_id","x","y");