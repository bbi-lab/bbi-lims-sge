ALTER TABLE "sg_rna_cloning_experiments" ALTER COLUMN "transformed_on" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" ALTER COLUMN "transformed_on" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sg_rna_cloning_experiments" ADD COLUMN "transformed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" ADD COLUMN "transformed" boolean DEFAULT false;