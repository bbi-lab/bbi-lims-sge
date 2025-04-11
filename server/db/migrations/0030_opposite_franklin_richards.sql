CREATE TABLE "extraction_lot_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experiment_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"concentration" double precision,
	"volume_used" double precision,
	"usage_on" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pellets" ADD COLUMN "extraction_experiment_id" uuid;--> statement-breakpoint
ALTER TABLE "extraction_lot_usage" ADD CONSTRAINT "extraction_lot_usage_experiment_id_extraction_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."extraction_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraction_lot_usage" ADD CONSTRAINT "extraction_lot_usage_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pellets" ADD CONSTRAINT "pellets_extraction_experiment_id_extraction_experiments_id_fk" FOREIGN KEY ("extraction_experiment_id") REFERENCES "public"."extraction_experiments"("id") ON DELETE no action ON UPDATE no action;