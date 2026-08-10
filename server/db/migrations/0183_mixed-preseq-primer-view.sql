CREATE OR REPLACE VIEW view_mixed_preseq_primers AS
  SELECT p.id, p.name, p.sequence_type, 'dna-preseq-1'::text AS primer_type, p.archived,
    jsonb_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) AS targets,
    jsonb_agg(DISTINCT jsonb_build_object('id', pr.id, 'name', pr.name)) AS projects
  FROM preseq_1_primers p
  LEFT JOIN preseq_1_primer_targets pt ON pt.preseq_1_primer_id = p.id
  LEFT JOIN targets t ON t.id = pt.target_id
  LEFT JOIN projects pr ON pr.id = t.project_id
  GROUP BY p.id
  UNION ALL
  SELECT p.id, p.name, p.sequence_type, 'dna-preseq-2'::text AS primer_type, p.archived,
    jsonb_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) AS targets,
    jsonb_agg(DISTINCT jsonb_build_object('id', pr.id, 'name', pr.name)) AS projects
  FROM preseq_2_primers p
  LEFT JOIN targets t ON t.id = p.target_id
  LEFT JOIN projects pr ON pr.id = t.project_id
  GROUP BY p.id
  UNION ALL
  SELECT p.id, p.name, p.sequence_type, 'rna-preseq-1'::text AS primer_type, p.archived,
    jsonb_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) AS targets,
    jsonb_agg(DISTINCT jsonb_build_object('id', pr.id, 'name', pr.name)) AS projects
  FROM rna_preseq_1_primers p
  LEFT JOIN rna_preseq_1_primer_targets pt ON pt.rna_preseq_1_primer_id = p.id
  LEFT JOIN targets t ON t.id = pt.target_id
  LEFT JOIN projects pr ON pr.id = t.project_id
  GROUP BY p.id
  UNION ALL
  SELECT p.id, p.name, p.sequence_type, 'rna-preseq-2'::text AS primer_type, p.archived,
    jsonb_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) AS targets,
    jsonb_agg(DISTINCT jsonb_build_object('id', pr.id, 'name', pr.name)) AS projects
  FROM rna_preseq_2_primers p
  LEFT JOIN rna_preseq_2_primer_targets pt ON pt.rna_preseq_2_primer_id = p.id
  LEFT JOIN targets t ON t.id = pt.target_id
  LEFT JOIN projects pr ON pr.id = t.project_id
  GROUP BY p.id;--> statement-breakpoint

DROP VIEW "public"."view_plates_with_well_counts";--> statement-breakpoint
CREATE VIEW "public"."view_plates_with_well_counts" AS (with plate_types(plate_type_value, plate_type_label, plate_type_desc) AS (VALUES ('pellet-storage', 'Pellet storage', 'Pellet storage'), ('lin-primer-storage', 'LIN primer storage', 'Linearization primer storage'), ('amp-primer-storage', 'AMP primer storage', 'Amplification primer storage'), ('ha-primer-storage', 'HA primer storage', 'Homology arm primer storage'), ('ha-puc19-primer-storage', 'HA pUC19 primer storage', 'Homology arm pUC19 arm primer storage'), ('sg-rna-oligo-storage', 'sgRNA oligo storage', 'sgRNA oligo storage'), ('sg-rna-oligo', 'sgRNA oligo', 'sgRNA oligo'), ('sg-rna-plasmid-storage', 'sgRNA plasmid storage', 'sgRNA plasmid storage'), ('sg-rna-plasmid', 'sgRNA plasmid', 'sgRNA plasmid'), ('lin-pcr', 'LIN PCR', 'Linearization primer PCR'), ('amp-pcr', 'AMP PCR', 'Amplification primer PCR'), ('ha-pcr', 'HA PCR', 'Homology arm primer PCR'), ('preseq-1', 'PreSeq 1', 'PreSeq 1'), ('preseq-2', 'PreSeq 2', 'PreSeq 2'), ('preseq-3', 'PreSeq 3', 'PreSeq 3'), ('dna-preseq-1', 'DNA PreSeq 1', 'DNA PreSeq 1'), ('dna-preseq-2', 'DNA PreSeq 2', 'DNA PreSeq 2'), ('dna-preseq-3', 'DNA PreSeq 3', 'DNA PreSeq 3'), ('rna-rt-storage', 'RNA RT storage', 'RNA Reverse Transcription storage'), ('rna-preseq-1', 'RNA PreSeq 1', 'RNA PreSeq 1'), ('rna-preseq-2', 'RNA PreSeq 2', 'RNA PreSeq 2'), ('rna-preseq-3', 'RNA PreSeq 3', 'RNA PreSeq 3'), ('snv-lib-preseq-2', 'SNVlib PreSeq 2', 'SNVlib PreSeq 2'), ('snv-lib-preseq-3', 'SNVlib PreSeq 3', 'SNVlib PreSeq 3'), ('seq-index', 'Seq index', 'Sequencing index plate'), ('clonal-ha', 'Clonal HA plate', 'Clonal HA plate'), ('dna-preseq-1-primer-storage', 'DNA PreSeq 1 primer storage', 'DNA PreSeq 1 primer storage'), ('dna-preseq-2-primer-storage', 'DNA PreSeq 2 primer storage', 'DNA PreSeq 2 primer storage'), ('rna-rt-primer-storage', 'RNA RT primer storage', 'RNA RT primer storage'), ('rna-preseq-1-primer-storage', 'RNA PreSeq 1 primer storage', 'RNA PreSeq 1 primer storage'), ('rna-preseq-2-primer-storage', 'RNA PreSeq 2 primer storage', 'RNA PreSeq 2 primer storage'), ('external-sample-indexing', 'External sample indexing', 'External sample indexing'), ('ha-pcr-product-storage', 'HA PCR product storage', 'HA PCR product storage'), ('ha-puc19-pcr-product-storage', 'HA pUC19 PCR product storage', 'HA pUC19 PCR product storage'), ('ha-puc19-gibson-product-storage', 'HA pUC19 Gibson product storage', 'HA pUC19 Gibson product storage'), ('ha-puc19-plasmid-storage', 'HA pUC19 plasmid storage', 'HA pUC19 plasmid storage'), ('snv-lib-amp-product-storage', 'SNVlib AMP product storage', 'SNVlib AMP product storage'), ('snv-lib-lin-product-storage', 'SNVlib LIN product storage', 'SNVlib LIN product storage'), ('snv-lib-gibson-product-storage', 'SNVlib Gibson product storage', 'SNVlib Gibson product storage'), ('snv-lib-plasmid-storage', 'SNVlib plasmid storage', 'SNVlib plasmid storage'), ('snv-lib-golden-gate-product-storage', 'SNVlib Golden Gate product storage', 'SNVlib Golden Gate product storage'), ('preseq-primer', 'PreSeq primer plate', 'PreSeq primer plate'), ('preseq-primer-storage', 'PreSeq primer storage', 'PreSeq primer storage')) select
    "plates"."id",
    "plates"."name",
    "plates"."size_x",
    "plates"."size_y",
    "plates"."plate_type",
    "plates"."discarded",
    "plates"."processed",
    "cycles"."id" as cycle_id,
    "cycles"."name" as cycle_name,
    string_agg(distinct "targets"."name", ',') as targets,
    (select distinct on (plate_type_value) plate_type_label from plate_types where plate_type_value = "plates"."plate_type") as plate_type_label,
    count(distinct("wells"."id")) as wells_count,
    count(distinct("well_contents"."well_id")) as wells_with_content_count,
    count(distinct("well_content_sources"."source_well_id")) as wells_processed_count,
    "sg_rna_cloning_experiments"."id" as sg_rna_cloning_experiment_id,
    "pcr_experiments"."id" as pcr_experiment_id
    from "plates"
    join "wells" on "plates"."id" = "wells"."plate_id"
    left join "well_content_sources" on "wells"."id" = "well_content_sources"."source_well_id"
    left join "well_contents" on "wells"."id" = "well_contents"."well_id"
    left join "pcr_experiments" on "plates"."id" = "pcr_experiments"."plate_id"
    left join "pcr_experiment_targets" on "pcr_experiments"."id" = "pcr_experiment_targets"."pcr_experiment_id"
    left join "transfect_targets" on "pcr_experiment_targets"."transfect_target_id" = "transfect_targets"."id"
    left join "targets" on "targets"."id" = "transfect_targets"."target_id"
    left join "transfect_experiments" on "transfect_targets"."experiment_id" = "transfect_experiments"."id"
    left join "cycles" on "transfect_experiments"."cycle_id" = "cycles"."id"
    left join "sg_rna_cloning_experiments" on "plates"."id" = "sg_rna_cloning_experiments"."plate_id"
    group by "plates"."id", "cycles"."id", "sg_rna_cloning_experiments"."id", "pcr_experiments"."id");
