CREATE TABLE "wellables" (
	"id" uuid PRIMARY KEY NOT NULL,
	"table_name" varchar NOT NULL,
	CONSTRAINT "wellable_table_name" CHECK ("wellables"."table_name" IN (
      'amplification_primers',
      'linearization_primers',
      'homology_arm_primers',
      'preseq_1_primers',
      'preseq_2_primers',
      'index_primers',
      'nucleic_acids',
      'pellets',
      'sg_rna_plasmids',
      'snv_lib_plasmids',
      'sg_rna_oligos',
      'external_samples'
    ))
);
--> statement-breakpoint
ALTER TABLE "well_contents" ADD COLUMN "wellable_id" uuid;--> statement-breakpoint
ALTER TABLE "well_contents" ADD CONSTRAINT "well_contents_wellable_id_wellables_id_fk" FOREIGN KEY ("wellable_id") REFERENCES "public"."wellables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Manually added SQL below to backfill wellables table and add trigger functions

INSERT INTO wellables (id, table_name) SELECT id, 'amplification_primers' from amplification_primers ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
INSERT INTO wellables (id, table_name) SELECT id, 'linearization_primers' from linearization_primers ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
INSERT INTO wellables (id, table_name) SELECT id, 'homology_arm_primers' from homology_arm_primers ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
INSERT INTO wellables (id, table_name) SELECT id, 'index_primers' from index_primers ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
INSERT INTO wellables (id, table_name) SELECT id, 'preseq_1_primers' from preseq_1_primers ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
INSERT INTO wellables (id, table_name) SELECT id, 'preseq_2_primers' from preseq_2_primers ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
INSERT INTO wellables (id, table_name) SELECT id, 'nucleic_acids' from nucleic_acids ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
INSERT INTO wellables (id, table_name) SELECT id, 'pellets' from pellets ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
INSERT INTO wellables (id, table_name) SELECT id, 'snv_lib_plasmids' from snv_lib_plasmids ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
INSERT INTO wellables (id, table_name) SELECT id, 'sg_rna_plasmids' from sg_rna_plasmids ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
INSERT INTO wellables (id, table_name) SELECT id, 'sg_rna_oligos' from sg_rna_oligos ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
INSERT INTO wellables (id, table_name) SELECT id, 'external_samples' from external_samples ON CONFLICT (id) DO NOTHING;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "wellables_insert"()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "wellables" (id, table_name) VALUES (NEW.id, TG_TABLE_NAME::regclass::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE OR REPLACE TRIGGER "amplification_primers_wellables_insert"
BEFORE INSERT ON "amplification_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "linearization_primers_wellables_insert"
BEFORE INSERT ON "linearization_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "homology_arm_primers_wellables_insert"
BEFORE INSERT ON "homology_arm_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "preseq_1_primers_wellables_insert"
BEFORE INSERT ON "preseq_1_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "preseq_2_primers_wellables_insert"
BEFORE INSERT ON "preseq_2_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "index_primers_wellables_insert"
BEFORE INSERT ON "index_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "nucleic_acids_wellables_insert"
BEFORE INSERT ON "nucleic_acids"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "pellets_wellables_insert"
BEFORE INSERT ON "pellets"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "sg_rna_plasmids_wellables_insert"
BEFORE INSERT ON "sg_rna_plasmids"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "snv_lib_plasmids_wellables_insert"
BEFORE INSERT ON "snv_lib_plasmids"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "sg_rna_oligos_wellables_insert"
BEFORE INSERT ON "sg_rna_oligos"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "external_samples_wellables_insert"
BEFORE INSERT ON "external_samples"
FOR EACH ROW
EXECUTE FUNCTION "wellables_insert"();--> statement-breakpoint

CREATE OR REPLACE FUNCTION "wellables_delete"()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM "wellables" WHERE id = OLD.id AND table_name = TG_TABLE_NAME::regclass::text;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE OR REPLACE TRIGGER "amplification_primers_wellables_delete"
BEFORE DELETE ON "amplification_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "linearization_primers_wellables_delete"
BEFORE DELETE ON "linearization_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "homology_arm_primers_wellables_delete"
BEFORE DELETE ON "homology_arm_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "preseq_1_primers_wellables_delete"
BEFORE DELETE ON "preseq_1_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "preseq_2_primers_wellables_delete"
BEFORE DELETE ON "preseq_2_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "index_primers_wellables_delete"
BEFORE DELETE ON "index_primers"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "nucleic_acids_wellables_delete"
BEFORE DELETE ON "nucleic_acids"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "pellets_wellables_delete"
BEFORE DELETE ON "pellets"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "sg_rna_plasmids_wellables_delete"
BEFORE DELETE ON "sg_rna_plasmids"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "snv_lib_plasmids_wellables_delete"
BEFORE DELETE ON "snv_lib_plasmids"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "sg_rna_oligos_wellables_delete"
BEFORE DELETE ON "sg_rna_oligos"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "external_samples_wellables_delete"
BEFORE DELETE ON "external_samples"
FOR EACH ROW
EXECUTE FUNCTION "wellables_delete"();
