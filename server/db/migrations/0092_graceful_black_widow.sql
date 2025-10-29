ALTER TABLE "sg_rna_plasmids" DROP CONSTRAINT "sg_rna_plasmids_sg_rna_cloning_experiment_id_sg_rna_cloning_experiments_id_fk";
--> statement-breakpoint
ALTER TABLE "sg_rna_plasmids" DROP COLUMN "sg_rna_cloning_experiment_id";