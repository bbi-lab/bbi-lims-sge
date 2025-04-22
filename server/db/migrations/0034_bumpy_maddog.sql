ALTER TABLE "nucleic_acids" DROP COLUMN "concentration";--> statement-breakpoint
ALTER TABLE "nucleic_acids" ADD CONSTRAINT "nucleic_acids_pellet_id_unique" UNIQUE("pellet_id");