CREATE TABLE "pcr2_experiment_master_mix_volumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pcr_experiment_id" uuid NOT NULL,
	"two_x_kapa_hifi_ready_mix" double precision DEFAULT 12.5 NOT NULL,
	"ten_um_forward_primer" double precision DEFAULT 0.75 NOT NULL,
	"ten_um_reverse_primer" double precision DEFAULT 0.75 NOT NULL,
	"ten_x_sybr_green" double precision DEFAULT 0 NOT NULL,
	"total" double precision DEFAULT 25 NOT NULL,
	CONSTRAINT "pcr2_experiment_master_mix_volumes_pcr_experiment_id_unique" UNIQUE("pcr_experiment_id")
);
--> statement-breakpoint
ALTER TABLE "pcr2_experiment_master_mix_volumes" ADD CONSTRAINT "pcr2_experiment_master_mix_volumes_pcr_experiment_id_pcr_experiments_id_fk" FOREIGN KEY ("pcr_experiment_id") REFERENCES "public"."pcr_experiments"("id") ON DELETE no action ON UPDATE no action;