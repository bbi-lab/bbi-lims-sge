CREATE TABLE "preseq_1_primer_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"preseq_1_primer_id" uuid NOT NULL,
	"target_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "preseq_1_primer_targets" ADD CONSTRAINT "preseq_1_primer_targets_preseq_1_primer_id_preseq_1_primers_id_fk" FOREIGN KEY ("preseq_1_primer_id") REFERENCES "public"."preseq_1_primers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preseq_1_primer_targets" ADD CONSTRAINT "preseq_1_primer_targets_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_preseq1_primer_target" ON "preseq_1_primer_targets" USING btree ("preseq_1_primer_id","target_id");--> statement-breakpoint

INSERT INTO "preseq_1_primer_targets" ("preseq_1_primer_id", "target_id")
SELECT "id", "target_id" FROM "preseq_1_primers"
WHERE "target_id" IS NOT NULL
ON CONFLICT DO NOTHING;
