ALTER TABLE "targets" DROP CONSTRAINT "targets_cycle_id_cycles_id_fk";
--> statement-breakpoint
ALTER TABLE "targets" DROP COLUMN "cycle_id";