ALTER TABLE "plasmids" ADD COLUMN "external_link" text;--> statement-breakpoint
ALTER TABLE "plasmids" ADD CONSTRAINT "external_link_check" CHECK ("plasmids"."external_link" ~* '^https?://.+$');