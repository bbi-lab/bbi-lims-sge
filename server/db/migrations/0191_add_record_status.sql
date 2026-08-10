CREATE TYPE "public"."record_statuses" AS ENUM('not-started', 'in-progress', 'on-hold', 'next-step-ready', 'complete', 'discarded');--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" ADD COLUMN "status" "record_statuses";--> statement-breakpoint
ALTER TABLE "snv_lib_gibson_products" ADD COLUMN "status" "record_statuses";--> statement-breakpoint
ALTER TABLE "snv_lib_golden_gate_products" ADD COLUMN "status" "record_statuses";--> statement-breakpoint
ALTER TABLE "snv_lib_lin_products" ADD COLUMN "status" "record_statuses";--> statement-breakpoint
ALTER TABLE "pcr_experiments" ADD COLUMN "status" "record_statuses";--> statement-breakpoint
ALTER TABLE "sg_rna_plasmids" ADD COLUMN "status" "record_statuses";--> statement-breakpoint
ALTER TABLE "snv_lib_plasmids" ADD COLUMN "status" "record_statuses";