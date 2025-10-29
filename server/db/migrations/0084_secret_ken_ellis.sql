ALTER TABLE "transfect_targets" ALTER COLUMN "sg_rna" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "transfect_targets" ADD COLUMN "snv_lib" uuid;--> statement-breakpoint
ALTER TABLE "transfect_targets" ADD COLUMN "negative_control" boolean;--> statement-breakpoint
ALTER TABLE "transfect_targets" ADD CONSTRAINT "transfect_targets_snv_lib_plasmids_id_fk" FOREIGN KEY ("snv_lib") REFERENCES "public"."plasmids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfect_targets" ADD CONSTRAINT "transfect_targets_sg_rna_plasmids_id_fk" FOREIGN KEY ("sg_rna") REFERENCES "public"."plasmids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfect_experiments" DROP COLUMN "negative_control";--> statement-breakpoint
ALTER TABLE "transfect_targets" DROP COLUMN "snv_library_to_3ug_vol";--> statement-breakpoint
ALTER TABLE "transfect_targets" DROP COLUMN "sg_rna_to_12ug_vol";--> statement-breakpoint
ALTER TABLE "transfect_targets" DROP COLUMN "hprt1_sg_rna_to_12ug_vol";--> statement-breakpoint
ALTER TABLE "transfect_targets" DROP COLUMN "snv_lib_needed";--> statement-breakpoint
ALTER TABLE "transfect_targets" DROP COLUMN "sg_rna_needed";