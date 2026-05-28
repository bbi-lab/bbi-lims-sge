CREATE TABLE "sge_oligo_lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sge_oligo_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sge_oligos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"target_id" uuid NOT NULL,
	"sequence" varchar(255),
	"library_type" varchar(100),
	"notes" text,
	CONSTRAINT "sge_oligos_name_unique" UNIQUE("name"),
	CONSTRAINT "sge_oligo_sequence_check" CHECK ("sge_oligos"."sequence" ~* '^[actg]*$')
);
--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" DROP CONSTRAINT "snv_lib_amp_products_twist_lot_id_lots_id_fk";
--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" ADD COLUMN "sge_oligo_id" uuid;--> statement-breakpoint
ALTER TABLE "sge_oligo_lots" ADD CONSTRAINT "sge_oligo_lots_sge_oligo_id_sge_oligos_id_fk" FOREIGN KEY ("sge_oligo_id") REFERENCES "public"."sge_oligos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sge_oligo_lots" ADD CONSTRAINT "sge_oligo_lots_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sge_oligos" ADD CONSTRAINT "sge_oligos_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_sge_oligo_lot" ON "sge_oligo_lots" USING btree ("sge_oligo_id","lot_id");--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" ADD CONSTRAINT "snv_lib_amp_products_sge_oligo_id_sge_oligos_id_fk" FOREIGN KEY ("sge_oligo_id") REFERENCES "public"."sge_oligos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" DROP COLUMN "twist_lot_id";
