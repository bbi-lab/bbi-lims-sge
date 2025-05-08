ALTER TABLE "pellets" RENAME COLUMN "replicates" TO "transfections";--> statement-breakpoint
ALTER TABLE "transfect_experiments" DROP CONSTRAINT "transfect_experiments_name_unique";--> statement-breakpoint
ALTER TABLE "transfect_experiments" ADD COLUMN "cycle" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "transfect_experiments" ADD CONSTRAINT "transfect_experiments_cycle_cycles_id_fk" FOREIGN KEY ("cycle") REFERENCES "public"."cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfect_experiments" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "transfect_experiments" ADD CONSTRAINT "transfect_experiments_cycle_unique" UNIQUE("cycle");