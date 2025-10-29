CREATE TABLE "pcr_1_primers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid,
	"name" varchar(255) NOT NULL,
	"sequence" varchar(255),
	"sequence_type" varchar,
	"notes" text,
	CONSTRAINT "sequence_check" CHECK ("pcr_1_primers"."sequence" ~* '^[actg]*$')
);
--> statement-breakpoint
CREATE TABLE "pcr_2_primers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid,
	"name" varchar(255) NOT NULL,
	"sequence" varchar(255),
	"sequence_type" varchar,
	"adapter_sequence" varchar(255),
	"notes" text,
	CONSTRAINT "sequence_check" CHECK ("pcr_2_primers"."sequence" ~* '^[actg]*$'),
	CONSTRAINT "adapter_sequence_check" CHECK ("pcr_2_primers"."adapter_sequence" ~* '^[actg]*$')
);
--> statement-breakpoint
ALTER TABLE "pcr_1_primers" ADD CONSTRAINT "pcr_1_primers_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pcr_2_primers" ADD CONSTRAINT "pcr_2_primers_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;