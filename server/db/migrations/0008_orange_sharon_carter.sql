ALTER TABLE "lots" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reagents" ALTER COLUMN "volume_unit" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reagents" ALTER COLUMN "solute_unit" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "reagents" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "lots" DROP COLUMN "name";--> statement-breakpoint
DROP TYPE "public"."lot_statuses";--> statement-breakpoint
DROP TYPE "public"."reagent_solute_units";--> statement-breakpoint
DROP TYPE "public"."reagent_volume_units";