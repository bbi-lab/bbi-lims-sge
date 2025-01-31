CREATE TYPE "public"."reagent_solute_units" AS ENUM('ng', 'µg', 'mg', 'g');--> statement-breakpoint
CREATE TYPE "public"."reagent_volume_units" AS ENUM('nL', 'µL', 'mL', 'L');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reagents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"volume_unit" "reagent_volume_units",
	"solute_unit" "reagent_solute_units",
	CONSTRAINT "reagents_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "reagent_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lots" ADD CONSTRAINT "lots_reagent_id_reagents_id_fk" FOREIGN KEY ("reagent_id") REFERENCES "public"."reagents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
