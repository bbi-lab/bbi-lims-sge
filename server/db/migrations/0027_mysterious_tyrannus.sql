ALTER TABLE "pellets" ALTER COLUMN "harvested_on" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pellets" ADD COLUMN "harvest_day" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "pellets" ADD COLUMN "protocol" varchar;