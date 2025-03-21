ALTER TABLE "lots" ADD COLUMN "remaining_volume" numeric;--> statement-breakpoint
ALTER TABLE "amplification_primers" ADD COLUMN "temperature" smallint;--> statement-breakpoint
ALTER TABLE "transfect_lot_usage" ADD COLUMN "volume_used" double precision;