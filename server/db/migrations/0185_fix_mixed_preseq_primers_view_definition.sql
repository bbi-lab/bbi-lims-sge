DROP VIEW "public"."view_mixed_preseq_primers";--> statement-breakpoint
CREATE VIEW "public"."view_mixed_preseq_primers" AS (
  SELECT p.id, p.name, p.sequence_type, 'dna-preseq-1'::text AS primer_type, p.archived,
    jsonb_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) AS targets,
    jsonb_agg(DISTINCT jsonb_build_object('id', pr.id, 'name', pr.name)) AS projects
  FROM "preseq_1_primers" p
  LEFT JOIN "preseq_1_primer_targets" pt ON pt.preseq_1_primer_id = p.id
  LEFT JOIN "targets" t ON t.id = pt.target_id
  LEFT JOIN "projects" pr ON pr.id = t.project_id
  GROUP BY p.id
  UNION ALL
  SELECT p.id, p.name, p.sequence_type, 'dna-preseq-2'::text AS primer_type, p.archived,
    jsonb_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) AS targets,
    jsonb_agg(DISTINCT jsonb_build_object('id', pr.id, 'name', pr.name)) AS projects
  FROM "preseq_2_primers" p
  LEFT JOIN "targets" t ON t.id = p.target_id
  LEFT JOIN "projects" pr ON pr.id = t.project_id
  GROUP BY p.id
  UNION ALL
  SELECT p.id, p.name, p.sequence_type, 'rna-preseq-1'::text AS primer_type, p.archived,
    jsonb_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) AS targets,
    jsonb_agg(DISTINCT jsonb_build_object('id', pr.id, 'name', pr.name)) AS projects
  FROM "rna_preseq_1_primers" p
  LEFT JOIN "rna_preseq_1_primer_targets" pt ON pt.rna_preseq_1_primer_id = p.id
  LEFT JOIN "targets" t ON t.id = pt.target_id
  LEFT JOIN "projects" pr ON pr.id = t.project_id
  GROUP BY p.id
  UNION ALL
  SELECT p.id, p.name, p.sequence_type, 'rna-preseq-2'::text AS primer_type, p.archived,
    jsonb_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) AS targets,
    jsonb_agg(DISTINCT jsonb_build_object('id', pr.id, 'name', pr.name)) AS projects
  FROM "rna_preseq_2_primers" p
  LEFT JOIN "rna_preseq_2_primer_targets" pt ON pt.rna_preseq_2_primer_id = p.id
  LEFT JOIN "targets" t ON t.id = pt.target_id
  LEFT JOIN "projects" pr ON pr.id = t.project_id
  GROUP BY p.id
);