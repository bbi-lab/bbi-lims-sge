ALTER TABLE "snv_lib_amp_products" DROP CONSTRAINT "snv_lib_amp_products_snv_lib_cloning_experiment_id_ha_cloning_experiments_id_fk";
--> statement-breakpoint
ALTER TABLE "snv_lib_gibson_products" DROP CONSTRAINT "snv_lib_gibson_products_snv_lib_cloning_experiment_id_ha_cloning_experiments_id_fk";
--> statement-breakpoint
ALTER TABLE "snv_lib_lin_products" DROP CONSTRAINT "snv_lib_lin_products_snv_lib_cloning_experiment_id_ha_cloning_experiments_id_fk";
--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" ALTER COLUMN "snv_lib_cloning_experiment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "snv_lib_gibson_products" ALTER COLUMN "snv_lib_cloning_experiment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "snv_lib_lin_products" ALTER COLUMN "snv_lib_cloning_experiment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" ADD CONSTRAINT "snv_lib_amp_products_snv_lib_cloning_experiment_id_snv_lib_cloning_experiments_id_fk" FOREIGN KEY ("snv_lib_cloning_experiment_id") REFERENCES "public"."snv_lib_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_gibson_products" ADD CONSTRAINT "snv_lib_gibson_products_snv_lib_cloning_experiment_id_snv_lib_cloning_experiments_id_fk" FOREIGN KEY ("snv_lib_cloning_experiment_id") REFERENCES "public"."snv_lib_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_lin_products" ADD CONSTRAINT "snv_lib_lin_products_snv_lib_cloning_experiment_id_snv_lib_cloning_experiments_id_fk" FOREIGN KEY ("snv_lib_cloning_experiment_id") REFERENCES "public"."snv_lib_cloning_experiments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ha_cloning_experiments" ADD CONSTRAINT "ha_cloning_experiments_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "snv_lib_cloning_experiments" ADD CONSTRAINT "snv_lib_cloning_experiments_name_unique" UNIQUE("name");