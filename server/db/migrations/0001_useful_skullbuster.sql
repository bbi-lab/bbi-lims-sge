ALTER TABLE "targets" ADD COLUMN "edit_start" integer;--> statement-breakpoint
ALTER TABLE "targets" ADD COLUMN "edit_stop" integer;--> statement-breakpoint
ALTER TABLE "targets" ADD COLUMN "amp_start" integer;--> statement-breakpoint
ALTER TABLE "targets" ADD COLUMN "amp_stop" integer;--> statement-breakpoint
ALTER TABLE "targets" ADD COLUMN "cigar" varchar(50);--> statement-breakpoint
ALTER TABLE "targets" ADD COLUMN "skip_positions" integer[];
