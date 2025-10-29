ALTER TABLE "snv_lib_gibson_products" ADD COLUMN "total_reaction_volume" double precision DEFAULT 10;--> statement-breakpoint
ALTER TABLE "snv_lib_plasmids" ADD COLUMN "plasmidsaurus_verification" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "snv_lib_plasmids" ADD COLUMN "ngs_verification_status" varchar;--> statement-breakpoint
ALTER TABLE "snv_lib_plasmids" DROP COLUMN "verification_status";