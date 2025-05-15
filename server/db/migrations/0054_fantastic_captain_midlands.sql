CREATE TABLE "index_primers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"sequence" varchar(255) NOT NULL,
	"index_sequence" varchar(255) NOT NULL,
	"primer_type" varchar,
	"kit" varchar,
	CONSTRAINT "sequence_check" CHECK ("index_primers"."sequence" ~* '^[actg]*$')
);
--> statement-breakpoint
ALTER TABLE "well_contents" DROP CONSTRAINT "one_item_per_well_content";--> statement-breakpoint
ALTER TABLE "well_contents" ADD COLUMN "index_primer_id" uuid;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_index_primer_id_index_primers_id_fk" FOREIGN KEY ("index_primer_id") REFERENCES "public"."index_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "one_item_per_well_content" CHECK (num_nonnulls("well_contents"."amplification_primer_id", "well_contents"."linearization_primer_id", "well_contents"."homology_arm_primer_id", "well_contents"."index_primer_id", "well_contents"."nucleic_acid_id", "well_contents"."pellet_id") = 1);