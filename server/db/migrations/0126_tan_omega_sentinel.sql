DROP VIEW "public"."view_ha_puc19_gibson_products_with_calcs";--> statement-breakpoint
ALTER TABLE "snv_lib_amp_products" ALTER COLUMN "snv_lib_cloning_experiment_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "snv_lib_gibson_products" ALTER COLUMN "snv_lib_cloning_experiment_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "snv_lib_lin_products" ALTER COLUMN "snv_lib_cloning_experiment_id" SET NOT NULL;--> statement-breakpoint
CREATE VIEW "public"."view_snv_lib_gibson_products" AS (SELECT
    *,
	CASE
		WHEN amp_volume IS NOT NULL AND lin_volume IS NOT NULL
		THEN amp_volume + lin_volume
		ELSE NULL
	END AS total_volume
FROM (
	SELECT *,
	CASE
		WHEN amp_product_vector_amount IS NOT NULL AND amp_product_concentration != 0
		THEN amp_product_vector_amount / amp_product_concentration
		ELSE NULL
	END AS amp_volume,
	CASE
		WHEN lin_product_vector_amount IS NOT NULL AND lin_product_concentration != 0
		THEN lin_product_vector_amount / lin_product_concentration
		ELSE NULL
	END AS lin_volume
FROM (
	SELECT
	"snv_lib_gibson_products".*,
	"snv_lib_cloning_experiments"."name" AS snv_lib_cloning_experiment_name,
	amp_products.id AS amp_product_id,
	amp_products.name AS amp_product_name,
	amp_products.amp_product_size AS amp_product_size,
	amp_products.quant AS amp_product_concentration,
	lin_products.id AS lin_product_id,
	lin_products.name AS lin_product_name,
	lin_products.quant AS lin_product_concentration,
	lin_products.ha_pcr_product_size AS ha_pcr_product_size,
    gibson_by_user.name AS gibson_by_name,
    cleaned_by_user.name AS cleaned_by_name,
    transformed_by_user.name AS transformed_by_name,
    prepped_by_user.name AS prepped_by_name,
	CASE
		WHEN lin_products.ha_pcr_product_size IS NOT NULL AND amp_products.amp_product_size IS NOT NULL
	 	THEN lin_products.ha_pcr_product_size - amp_products.amp_product_size + 2649
	 	ELSE NULL
	END AS lin_product_size,
	CASE
		WHEN lin_products.ha_pcr_product_size IS NOT NULL AND amp_products.amp_product_size IS NOT NULL
		AND amp_products.amp_product_size IS NOT NULL AND snv_lib_gibson_products.lin_product_vector_amount IS NOT NULL
		AND amp_products.amp_product_size - lin_products.ha_pcr_product_size != 2649
		THEN 7.0 * amp_products.amp_product_size / (lin_products.ha_pcr_product_size - amp_products.amp_product_size + 2649) * snv_lib_gibson_products.lin_product_vector_amount
		ELSE NULL
	END AS amp_product_vector_amount
FROM "snv_lib_gibson_products"
JOIN "snv_lib_cloning_experiments" ON "snv_lib_cloning_experiments"."id" = "snv_lib_gibson_products"."snv_lib_cloning_experiment_id"
LEFT JOIN "users" AS prepped_by_user ON prepped_by_user.id = "snv_lib_gibson_products"."prepped_by"
LEFT JOIN "users" AS transformed_by_user ON transformed_by_user.id = "snv_lib_gibson_products"."transformed_by"
LEFT JOIN "users" AS cleaned_by_user ON cleaned_by_user.id = "snv_lib_gibson_products"."cleaned_by"
LEFT JOIN "users" AS gibson_by_user ON gibson_by_user.id = "snv_lib_gibson_products"."gibson_by"
LEFT JOIN
	(SELECT "snv_lib_lin_products"."id" AS id,
		"snv_lib_lin_products"."name" AS name,
		"snv_lib_lin_products"."snv_lib_cloning_experiment_id" AS snv_lib_cloning_experiment_id,
		"snv_lib_lin_products"."quant" AS quant,
		CASE
			 WHEN "ha_pcr_products"."start_position" IS NOT NULL AND "ha_pcr_products"."stop_position" IS NOT NULL
			 THEN
			 	"ha_pcr_products"."stop_position" - "ha_pcr_products"."start_position" + 1
			 ELSE NULL
		END AS ha_pcr_product_size
		FROM "snv_lib_lin_products"
			LEFT JOIN "ha_puc19_plasmids" ON "ha_puc19_plasmids"."id" = "snv_lib_lin_products"."ha_puc19_plasmid_id"
			LEFT JOIN "ha_puc19_gibson_products" ON "ha_puc19_plasmids"."ha_puc19_gibson_product_id" = "ha_puc19_gibson_products"."id"
			LEFT JOIN "ha_puc19_pcr_products" ON "ha_puc19_gibson_products"."ha_puc19_pcr_product_id" = "ha_puc19_pcr_products"."id"
			LEFT JOIN "ha_pcr_products" ON "ha_puc19_pcr_products"."ha_pcr_product_id" = "ha_pcr_products"."id"
	) lin_products ON lin_products.snv_lib_cloning_experiment_id = "snv_lib_gibson_products"."snv_lib_cloning_experiment_id"
LEFT JOIN (
	SELECT
        "snv_lib_amp_products"."id" AS id,
		"snv_lib_amp_products"."name" AS name,
		"snv_lib_amp_products"."snv_lib_cloning_experiment_id" AS snv_lib_cloning_experiment_id,
		"snv_lib_amp_products"."quant" AS quant,
		CASE
			 WHEN "snv_lib_amp_products"."start_position" IS NOT NULL AND "snv_lib_amp_products"."stop_position" IS NOT NULL
			 THEN "snv_lib_amp_products"."stop_position" - "snv_lib_amp_products"."start_position" + 1
			 ELSE NULL
		END AS amp_product_size
	FROM "snv_lib_amp_products"
    ) amp_products ON amp_products.snv_lib_cloning_experiment_id = "snv_lib_gibson_products"."snv_lib_cloning_experiment_id"
) t2 ) t3);--> statement-breakpoint
CREATE VIEW "public"."view_ha_puc19_gibson_products_with_calcs" AS (SELECT
    "ha_puc19_gibson_products"."id" AS id,
    "ha_puc19_gibson_products"."name" AS name,
    "ha_puc19_pcr_products"."id" AS ha_puc19_pcr_product_id,
    "ha_puc19_pcr_products"."name" AS ha_puc19_pcr_product_name,
    "ha_puc19_gibson_products"."puc19_vector_amount" AS puc19_vector_amount,
    "ha_puc19_gibson_products"."puc19_vector_concentration" AS puc19_vector_concentration,
    "ha_puc19_gibson_products"."quant" AS quant,
    "ha_puc19_gibson_products"."prepped_on" AS prepped_on,
    "users"."name" AS prepped_by_name,
    "ha_cloning_experiments"."id" AS ha_cloning_experiment_id,
    "ha_cloning_experiments"."name" AS ha_cloning_experiment_name,
    t_ha_pcr_products.id AS ha_pcr_product_id,
    t_ha_pcr_products.name AS ha_pcr_product_name,
    t_ha_pcr_products.ha_pcr_product_length AS ha_pcr_product_length,
    CASE
        WHEN "ha_puc19_gibson_products"."puc19_vector_amount" IS NOT NULL AND t_ha_pcr_products.ha_pcr_product_length IS NOT NULL
            THEN t_ha_pcr_products.ha_pcr_product_length / 2649.0 * "ha_puc19_gibson_products"."puc19_vector_amount" * 2.0
        ELSE NULL
    END AS insert_dna_mass,
    CASE
        WHEN "ha_puc19_gibson_products"."puc19_vector_amount" IS NOT NULL AND t_ha_pcr_products.ha_pcr_product_length IS NOT NULL AND "ha_puc19_gibson_products"."quant" IS NOT NULL
            THEN t_ha_pcr_products.ha_pcr_product_length / 2649.0 * "ha_puc19_gibson_products"."puc19_vector_amount" * 2.0 / "ha_puc19_gibson_products"."quant"
        ELSE NULL
    END AS insert_volume,
    CASE
        WHEN "ha_puc19_gibson_products"."puc19_vector_amount" IS NOT NULL AND "ha_puc19_gibson_products"."puc19_vector_concentration" IS NOT NULL
            THEN "ha_puc19_gibson_products"."puc19_vector_amount" / "ha_puc19_gibson_products"."puc19_vector_concentration"
        ELSE NULL
    END AS vector_volume,
    "ha_puc19_gibson_products"."notes" AS notes
FROM "ha_puc19_gibson_products"
    JOIN "ha_puc19_pcr_products" ON "ha_puc19_pcr_products"."id" = "ha_puc19_gibson_products"."ha_puc19_pcr_product_id"
    JOIN (
        SELECT
            "ha_pcr_products"."id" AS id,
            "ha_pcr_products"."name" AS name,
            "ha_pcr_products"."ha_cloning_experiment_id" AS ha_cloning_experiment_id,
            CASE
                WHEN "ha_pcr_products"."start_position" IS NOT NULL AND "ha_pcr_products"."stop_position" IS NOT NULL
                    THEN "ha_pcr_products"."stop_position" - "ha_pcr_products"."start_position" + 1
                ELSE NULL
            END AS ha_pcr_product_length
        FROM  "ha_pcr_products"
    ) AS t_ha_pcr_products ON t_ha_pcr_products.id = "ha_puc19_pcr_products"."ha_pcr_product_id"
    JOIN "ha_cloning_experiments" ON "ha_cloning_experiments"."id" = t_ha_pcr_products.ha_cloning_experiment_id
    LEFT JOIN "users" ON "users"."id" = "ha_puc19_gibson_products"."prepped_by");