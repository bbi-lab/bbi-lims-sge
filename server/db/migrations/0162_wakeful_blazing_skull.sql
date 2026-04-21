CREATE TABLE "clonal_ha_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clonal_ha_id" uuid NOT NULL,
	"target_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clonal_has" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"order_number" varchar(255),
	"ordered_on" timestamp,
	"start" integer,
	"end" integer,
	"notes" text,
	CONSTRAINT "clonal_has_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "clonal_ha_targets" ADD CONSTRAINT "clonal_ha_targets_clonal_ha_id_clonal_has_id_fk" FOREIGN KEY ("clonal_ha_id") REFERENCES "public"."clonal_has"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clonal_ha_targets" ADD CONSTRAINT "clonal_ha_targets_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_clonal_ha_target" ON "clonal_ha_targets" USING btree ("clonal_ha_id","target_id");