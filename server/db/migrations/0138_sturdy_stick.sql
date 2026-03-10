CREATE TABLE "dna" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extraction_experiment_id" uuid,
	"pellet_id" uuid,
	"concentration" double precision,
	"volume" double precision,
	"yield" double precision,
	"protocol" varchar,
	"notes" text,
	CONSTRAINT "dna_pellet_id_unique" UNIQUE("pellet_id")
);
--> statement-breakpoint
CREATE TABLE "rna" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extraction_experiment_id" uuid,
	"pellet_id" uuid,
	"concentration" double precision,
	"volume" double precision,
	"yield" double precision,
	"protocol" varchar,
	"notes" text,
	CONSTRAINT "rna_pellet_id_unique" UNIQUE("pellet_id")
);
--> statement-breakpoint
ALTER TABLE "dna" ADD CONSTRAINT "dna_extraction_experiment_id_extraction_experiments_id_fk" FOREIGN KEY ("extraction_experiment_id") REFERENCES "public"."extraction_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dna" ADD CONSTRAINT "dna_pellet_id_pellets_id_fk" FOREIGN KEY ("pellet_id") REFERENCES "public"."pellets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rna" ADD CONSTRAINT "rna_extraction_experiment_id_extraction_experiments_id_fk" FOREIGN KEY ("extraction_experiment_id") REFERENCES "public"."extraction_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rna" ADD CONSTRAINT "rna_pellet_id_pellets_id_fk" FOREIGN KEY ("pellet_id") REFERENCES "public"."pellets"("id") ON DELETE no action ON UPDATE no action;