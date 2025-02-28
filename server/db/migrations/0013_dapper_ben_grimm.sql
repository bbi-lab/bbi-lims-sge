CREATE TABLE "amplification_primers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"sequence" varchar(255) NOT NULL,
	"sequence_type" varchar NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "homology_arm_primers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"sequence" varchar(255) NOT NULL,
	"sequence_type" varchar NOT NULL,
	"cloning_strategy" varchar NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "linearization_primers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"sequence" varchar(255) NOT NULL,
	"sequence_type" varchar NOT NULL,
	"notes" text
);
