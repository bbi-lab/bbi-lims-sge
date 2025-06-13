ALTER TABLE "well_sources" RENAME COLUMN "started_on" TO "created_on";--> statement-breakpoint
ALTER TABLE "well_sources" RENAME COLUMN "harvested_by" TO "created_by";--> statement-breakpoint
ALTER TABLE "well_sources" DROP CONSTRAINT "well_sources_harvested_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "well_sources" ADD CONSTRAINT "well_sources_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;