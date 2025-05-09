ALTER TABLE "transfect_experiments" RENAME COLUMN "cycle" TO "cycle_id";--> statement-breakpoint
ALTER TABLE "transfect_experiments" DROP CONSTRAINT "transfect_experiments_cycle_unique";--> statement-breakpoint
ALTER TABLE "transfect_experiments" DROP CONSTRAINT "transfect_experiments_cycle_cycles_id_fk";
--> statement-breakpoint
ALTER TABLE "transfect_experiments" ADD CONSTRAINT "transfect_experiments_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfect_experiments" ADD CONSTRAINT "transfect_experiments_cycle_id_unique" UNIQUE("cycle_id");