CREATE TABLE "well_content_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"well_content_id" uuid NOT NULL,
	"source_well_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "unique_well_content_id_source_well_id" UNIQUE("well_content_id","source_well_id")
);
--> statement-breakpoint
ALTER TABLE "well_content_sources" ADD CONSTRAINT "well_content_sources_well_content_id_well_contents_id_fk" FOREIGN KEY ("well_content_id") REFERENCES "public"."well_contents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_content_sources" ADD CONSTRAINT "well_content_sources_source_well_id_wells_id_fk" FOREIGN KEY ("source_well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_content_sources" ADD CONSTRAINT "well_content_sources_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;