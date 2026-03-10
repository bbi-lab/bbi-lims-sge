ALTER TABLE "transfect_targets" ADD COLUMN "snv_library_quantity" double precision DEFAULT 5;--> statement-breakpoint
ALTER TABLE "transfect_targets" ADD COLUMN "sg_rna_quantity" double precision DEFAULT 10;--> statement-breakpoint

UPDATE "transfect_targets" AS t1
SET
    snv_library_quantity = 3,
    sg_rna_quantity = 12
FROM "transfect_experiments"
JOIN "cycles" ON "transfect_experiments"."cycle_id" = "cycles"."id"
WHERE
	t1."experiment_id" = "transfect_experiments"."id"
	AND "cycles"."name" <= 'SGE058';--> statement-breakpoint

UPDATE "transfect_targets" AS t1
SET
    snv_library_quantity = 5,
    sg_rna_quantity = 10
FROM "transfect_experiments"
JOIN "cycles" ON "transfect_experiments"."cycle_id" = "cycles"."id"
WHERE
	t1."experiment_id" = "transfect_experiments"."id"
	AND "cycles"."name" > 'SGE058';
