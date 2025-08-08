ALTER TABLE "targets" ADD COLUMN "sequence" text;--> statement-breakpoint
ALTER TABLE "targets" ADD CONSTRAINT "sequence_check" CHECK ("targets"."sequence" ~* '^[actg]+$');