CREATE TABLE "sequencing_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" varchar DEFAULT 'pending',
	"created_on" timestamp,
	"started_on" timestamp,
	"ended_on" timestamp,
	CONSTRAINT "sequencing_runs_name_unique" UNIQUE("name")
);
