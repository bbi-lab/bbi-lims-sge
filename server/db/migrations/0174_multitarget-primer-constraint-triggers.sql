-- Custom SQL migration file for constraint triggers on multitarget primers --
-- This migration adds a trigger to ensure that for each sequence type, the combination of target ids associated with primers is unique for primers that are not archived.
-- This prevents having multiple primers with the same sequence type and identical sets of targets, which could lead to confusion in downstream applications.
-- Triggers included on primer and related targets tables and are deffered until the end of the transaction to ensure both primer and related targets table have been updated before the constraint is checked.

CREATE OR REPLACE FUNCTION unique_primer_targets()
RETURNS TRIGGER AS $$
DECLARE
    primer_table REGCLASS := TG_ARGV[0];
    related_targets_table REGCLASS := TG_ARGV[1];
    join_field TEXT := TG_ARGV[2];
 	result boolean;
BEGIN
	EXECUTE format('SELECT EXISTS (
		SELECT COUNT(*) FROM (
			SELECT sequence_type, array_agg(target_id ORDER BY target_id) AS targets
			FROM %I
			JOIN %I ON %I.id = %I
			WHERE archived IS NOT TRUE
			GROUP BY %I.id
		) GROUP BY sequence_type, targets
		HAVING COUNT(*) > 1)', primer_table, related_targets_table, primer_table, join_field, primer_table)
	INTO result;
  IF result THEN
    RAISE EXCEPTION 'Constraint violated';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Homology arm primers

DROP TRIGGER IF EXISTS homology_arm_primers_unique_targets ON homology_arm_primers;--> statement-breakpoint

CREATE CONSTRAINT TRIGGER homology_arm_primers_unique_targets
AFTER INSERT OR UPDATE ON homology_arm_primers
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION unique_primer_targets('homology_arm_primers', 'homology_arm_primer_targets', 'homology_arm_primer_id');--> statement-breakpoint

DROP TRIGGER IF EXISTS homology_arm_primer_targets_unique_targets ON homology_arm_primer_targets;--> statement-breakpoint

CREATE CONSTRAINT TRIGGER homology_arm_primer_targets_unique_targets
AFTER INSERT OR UPDATE ON homology_arm_primer_targets
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION unique_primer_targets('homology_arm_primers', 'homology_arm_primer_targets', 'homology_arm_primer_id');--> statement-breakpoint


-- DNA preseq 1 primers

DROP TRIGGER IF EXISTS preseq_1_primers_unique_targets ON preseq_1_primers;--> statement-breakpoint

CREATE CONSTRAINT TRIGGER preseq_1_primers_unique_targets
AFTER INSERT OR UPDATE ON preseq_1_primers
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION unique_primer_targets('preseq_1_primers', 'preseq_1_primer_targets', 'preseq_1_primer_id');--> statement-breakpoint

DROP TRIGGER IF EXISTS preseq_1_primer_targets_unique_targets ON preseq_1_primer_targets;--> statement-breakpoint

CREATE CONSTRAINT TRIGGER preseq_1_primer_targets_unique_targets
AFTER INSERT OR UPDATE ON preseq_1_primer_targets
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION unique_primer_targets('preseq_1_primers', 'preseq_1_primer_targets', 'preseq_1_primer_id');--> statement-breakpoint


-- RNA preseq 1 primers

DROP TRIGGER IF EXISTS rna_preseq_1_primers_unique_targets ON rna_preseq_1_primers;--> statement-breakpoint

CREATE CONSTRAINT TRIGGER rna_preseq_1_primers_unique_targets
AFTER INSERT OR UPDATE ON rna_preseq_1_primers
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION unique_primer_targets('rna_preseq_1_primers', 'rna_preseq_1_primer_targets', 'rna_preseq_1_primer_id');--> statement-breakpoint

DROP TRIGGER IF EXISTS rna_preseq_1_primer_targets_unique_targets ON rna_preseq_1_primer_targets;--> statement-breakpoint

CREATE CONSTRAINT TRIGGER rna_preseq_1_primer_targets_unique_targets
AFTER INSERT OR UPDATE ON rna_preseq_1_primer_targets
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION unique_primer_targets('rna_preseq_1_primers', 'rna_preseq_1_primer_targets', 'rna_preseq_1_primer_id');--> statement-breakpoint

-- RNA preseq 2 primers

DROP TRIGGER IF EXISTS rna_preseq_2_primers_unique_targets ON rna_preseq_2_primers;--> statement-breakpoint

CREATE CONSTRAINT TRIGGER rna_preseq_2_primers_unique_targets
AFTER INSERT OR UPDATE ON rna_preseq_2_primers
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION unique_primer_targets('rna_preseq_2_primers', 'rna_preseq_2_primer_targets', 'rna_preseq_2_primer_id');--> statement-breakpoint

DROP TRIGGER IF EXISTS rna_preseq_2_primer_targets_unique_targets ON rna_preseq_2_primer_targets;--> statement-breakpoint

CREATE CONSTRAINT TRIGGER rna_preseq_2_primer_targets_unique_targets
AFTER INSERT OR UPDATE ON rna_preseq_2_primer_targets
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION unique_primer_targets('rna_preseq_2_primers', 'rna_preseq_2_primer_targets', 'rna_preseq_2_primer_id');
