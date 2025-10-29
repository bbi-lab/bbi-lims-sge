ALTER TABLE "plasmids" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "plasmids" ADD CONSTRAINT "plasmids_name_unique" UNIQUE("name");