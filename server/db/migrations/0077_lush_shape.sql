CREATE TABLE "oligos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid,
	"name" varchar(255) NOT NULL,
	"sequence" varchar(255),
	"direction" varchar,
	"oligo_type" varchar,
	"notes" text,
	CONSTRAINT "oligos_name_unique" UNIQUE("name"),
	CONSTRAINT "sequence_check" CHECK ("oligos"."sequence" ~* '^[actg]*$')
);
--> statement-breakpoint
ALTER TABLE "oligos" ADD CONSTRAINT "oligos_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;