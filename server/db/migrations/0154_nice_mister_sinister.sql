CREATE TABLE "rna_preseq_1_primer_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rna_preseq_1_primer_id" uuid NOT NULL,
	"target_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rna_preseq_1_primers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"sequence" varchar(255),
	"sequence_type" varchar,
	"ordered_on" timestamp,
	"notes" text,
	CONSTRAINT "rna_preseq_1_primers_name_unique" UNIQUE("name"),
	CONSTRAINT "sequence_check" CHECK ("rna_preseq_1_primers"."sequence" ~* '^[actg]*$')
);
--> statement-breakpoint
CREATE TABLE "rna_preseq_2_primer_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rna_preseq_2_primer_id" uuid NOT NULL,
	"target_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rna_preseq_2_primers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid,
	"name" varchar(255) NOT NULL,
	"sequence" varchar(255),
	"sequence_type" varchar,
	"adapter_sequence" varchar(255),
	"ordered_on" timestamp,
	"notes" text,
	CONSTRAINT "rna_preseq_2_primers_name_unique" UNIQUE("name"),
	CONSTRAINT "sequence_check" CHECK ("rna_preseq_2_primers"."sequence" ~* '^[actg]*$'),
	CONSTRAINT "adapter_sequence_check" CHECK ("rna_preseq_2_primers"."adapter_sequence" ~* '^[actg]*$')
);
--> statement-breakpoint
CREATE TABLE "rna_rt_primers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gene_id" uuid,
	"name" varchar(255) NOT NULL,
	"sequence" varchar(255),
	"sequence_type" varchar,
	"ordered_on" timestamp,
	"notes" text,
	CONSTRAINT "rna_rt_primers_name_unique" UNIQUE("name"),
	CONSTRAINT "sequence_check" CHECK ("rna_rt_primers"."sequence" ~* '^[actg]*$')
);
--> statement-breakpoint
ALTER TABLE "rna_preseq_1_primer_targets" ADD CONSTRAINT "rna_preseq_1_primer_targets_rna_preseq_1_primer_id_rna_preseq_1_primers_id_fk" FOREIGN KEY ("rna_preseq_1_primer_id") REFERENCES "public"."rna_preseq_1_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rna_preseq_1_primer_targets" ADD CONSTRAINT "rna_preseq_1_primer_targets_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rna_preseq_2_primer_targets" ADD CONSTRAINT "rna_preseq_2_primer_targets_rna_preseq_2_primer_id_rna_preseq_2_primers_id_fk" FOREIGN KEY ("rna_preseq_2_primer_id") REFERENCES "public"."rna_preseq_2_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rna_preseq_2_primer_targets" ADD CONSTRAINT "rna_preseq_2_primer_targets_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rna_preseq_2_primers" ADD CONSTRAINT "rna_preseq_2_primers_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rna_rt_primers" ADD CONSTRAINT "rna_rt_primers_gene_id_genes_id_fk" FOREIGN KEY ("gene_id") REFERENCES "public"."genes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_rna_preseq1_primer_target" ON "rna_preseq_1_primer_targets" USING btree ("rna_preseq_1_primer_id","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_rna_preseq2_primer_target" ON "rna_preseq_2_primer_targets" USING btree ("rna_preseq_2_primer_id","target_id");--> statement-breakpoint

CREATE OR REPLACE TRIGGER "rna_preseq1_primers_wellables_insert"
BEFORE INSERT ON "rna_preseq_1_primers"
FOR EACH ROW
EXECUTE FUNCTION wellables_insert();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "rna_preseq1_primers_wellables_delete"
BEFORE DELETE ON "rna_preseq_1_primers"
FOR EACH ROW
EXECUTE FUNCTION wellables_delete();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "rna_preseq2_primers_wellables_insert"
BEFORE INSERT ON "rna_preseq_2_primers"
FOR EACH ROW
EXECUTE FUNCTION wellables_insert();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "rna_preseq2_primers_wellables_delete"
BEFORE DELETE ON "rna_preseq_2_primers"
FOR EACH ROW
EXECUTE FUNCTION wellables_delete();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "rna_rt_primers_wellables_insert"
BEFORE INSERT ON "rna_rt_primers"
FOR EACH ROW
EXECUTE FUNCTION wellables_insert();--> statement-breakpoint

CREATE OR REPLACE TRIGGER "rna_rt_primers_wellables_delete"
BEFORE DELETE ON "rna_rt_primers"
FOR EACH ROW
EXECUTE FUNCTION wellables_delete();--> statement-breakpoint

ALTER TABLE "wellables" DROP CONSTRAINT "wellable_table_name";--> statement-breakpoint
ALTER TABLE "wellables" ADD CONSTRAINT "wellable_table_name" CHECK ("wellables"."table_name" IN (
      'amplification_primers',
      'linearization_primers',
      'homology_arm_primers',
      'homology_arm_puc19_primers',
      'preseq_1_primers',
      'preseq_2_primers',
	  'rna_preseq_1_primers',
	  'rna_preseq_2_primers',
	  'rna_rt_primers',
      'index_primers',
      'nucleic_acids',
      'dna',
      'rna',
      'pellets',
      'sg_rna_plasmids',
      'snv_lib_plasmids',
      'sg_rna_oligos',
      'external_samples',
      'ha_pcr_products',
      'ha_puc19_pcr_products',
      'ha_puc19_gibson_products',
      'ha_puc19_plasmids',
      'snv_lib_amp_products',
      'snv_lib_lin_products',
      'snv_lib_gibson_products',
      'snv_lib_plasmids',
      'snv_lib_clonal_dna_products',
      'snv_lib_golden_gate_products'
    ));
