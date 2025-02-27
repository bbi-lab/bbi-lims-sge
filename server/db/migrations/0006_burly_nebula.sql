CREATE TABLE IF NOT EXISTS "transfect_lot_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experiment_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"concentration" double precision,
	"usage_on" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "lots" ALTER COLUMN "lot_number" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "lots" ALTER COLUMN "lot_number" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transfect_lot_usage" ADD CONSTRAINT "transfect_lot_usage_experiment_id_transfect_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."transfect_experiments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transfect_lot_usage" ADD CONSTRAINT "transfect_lot_usage_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
