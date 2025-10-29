ALTER TABLE "wellables" DROP CONSTRAINT "wellable_table_name";--> statement-breakpoint
ALTER TABLE "wellables" ADD CONSTRAINT "wellable_table_name" CHECK ("wellables"."table_name" IN (
      'amplification_primers',
      'linearization_primers',
      'homology_arm_primers',
      'homology_arm_puc19_primers',
      'preseq_1_primers',
      'preseq_2_primers',
      'index_primers',
      'nucleic_acids',
      'pellets',
      'sg_rna_plasmids',
      'snv_lib_plasmids',
      'sg_rna_oligos',
      'external_samples',
      'ha_pcr_products',
      'ha_puc19_pcr_products',
      'ha_puc19_gibson_products',
      'ha_puc19_plasmids'
    ));-->statement-breakpoint

CREATE OR REPLACE TRIGGER "homology_arm_puc19_primers_wellables_insert"
BEFORE INSERT ON "homology_arm_puc19_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "homology_arm_puc19_primers_wellables_delete"
BEFORE DELETE ON "homology_arm_puc19_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "ha_pcr_products_wellables_insert"
BEFORE INSERT ON "ha_pcr_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "ha_pcr_products_wellables_delete"
BEFORE DELETE ON "ha_pcr_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "ha_puc19_pcr_products_wellables_insert"
BEFORE INSERT ON "ha_puc19_pcr_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "ha_puc19_pcr_products_wellables_delete"
BEFORE DELETE ON "ha_puc19_pcr_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "ha_puc19_gibson_products_wellables_insert"
BEFORE INSERT ON "ha_puc19_gibson_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "ha_puc19_gibson_products_wellables_delete"
BEFORE DELETE ON "ha_puc19_gibson_products"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "ha_puc19_plasmids_wellables_insert"
BEFORE INSERT ON "ha_puc19_plasmids"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "ha_puc19_plasmids_wellables_delete"
BEFORE DELETE ON "ha_puc19_plasmids"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();
