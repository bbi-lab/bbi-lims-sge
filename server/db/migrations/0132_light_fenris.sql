DROP VIEW "public"."view_ha_puc19_gibson_products_with_calcs";--> statement-breakpoint
ALTER TABLE "ha_puc19_gibson_products" ADD COLUMN "total_reaction_volume" double precision DEFAULT 10;--> statement-breakpoint
CREATE VIEW "public"."view_ha_puc19_gibson_products_with_calcs" AS (SELECT
        *,
        CASE WHEN two_x_nebuilder_reagent_volume IS NOT NULL AND insert_volume IS NOT NULL AND vector_volume IS NOT NULL
            THEN two_x_nebuilder_reagent_volume - (insert_volume + vector_volume)
            ELSE NULL
        END AS h2o_volume
    FROM (SELECT
        "ha_puc19_gibson_products"."id" AS id,
        "ha_puc19_gibson_products"."name" AS name,
        "ha_puc19_pcr_products"."id" AS ha_puc19_pcr_product_id,
        "ha_puc19_pcr_products"."name" AS ha_puc19_pcr_product_name,
        "ha_puc19_gibson_products"."puc19_vector_amount" AS puc19_vector_amount,
        "ha_puc19_gibson_products"."puc19_vector_concentration" AS puc19_vector_concentration,
        "ha_puc19_gibson_products"."quant" AS quant,
        "ha_puc19_gibson_products"."prepped_on" AS prepped_on,
        "ha_puc19_gibson_products"."total_reaction_volume" AS total_reaction_volume,
        CASE WHEN "ha_puc19_gibson_products"."total_reaction_volume" IS NOT NULL THEN "ha_puc19_gibson_products"."total_reaction_volume"/2 ELSE NULL END AS two_x_nebuilder_reagent_volume,
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
        CASE
            WHEN "ha_puc19_gibson_products"."puc19_vector_amount" IS NOT NULL AND t_ha_pcr_products.ha_pcr_product_length IS NOT NULL AND "ha_puc19_gibson_products"."quant" IS NOT NULL AND "ha_puc19_gibson_products"."puc19_vector_concentration" IS NOT NULL
                THEN (t_ha_pcr_products.ha_pcr_product_length / 2649.0 * "ha_puc19_gibson_products"."puc19_vector_amount" * 2.0 / "ha_puc19_gibson_products"."quant") + ("ha_puc19_gibson_products"."puc19_vector_amount" / "ha_puc19_gibson_products"."puc19_vector_concentration")
            ELSE NULL
        END AS total_volume,
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
        LEFT JOIN "users" ON "users"."id" = "ha_puc19_gibson_products"."prepped_by") t1);