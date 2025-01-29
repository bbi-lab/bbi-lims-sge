CREATE TYPE "public"."lot_statuses" AS ENUM('current', 'needs_testing', 'rejected', 'tested', 'used');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"status" "lot_statuses",
	"lot_number" smallint,
	"started_use_on" timestamp,
	"ended_use_on" timestamp,
	"expires_on" timestamp
);
