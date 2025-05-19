CREATE TABLE "well_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_well_id" uuid NOT NULL,
	"dest_well_id" uuid NOT NULL,
	"started_on" timestamp DEFAULT now(),
	"harvested_by" uuid,
	CONSTRAINT "unique_well_source_dest" UNIQUE("source_well_id","dest_well_id")
);
--> statement-breakpoint
ALTER TABLE "well_sources" ADD CONSTRAINT "well_sources_source_well_id_wells_id_fk" FOREIGN KEY ("source_well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_sources" ADD CONSTRAINT "well_sources_dest_well_id_wells_id_fk" FOREIGN KEY ("dest_well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_sources" ADD CONSTRAINT "well_sources_harvested_by_users_id_fk" FOREIGN KEY ("harvested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;