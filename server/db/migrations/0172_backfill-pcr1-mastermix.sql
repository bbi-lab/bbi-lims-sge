-- Custom SQL migration file, put your code below! --
INSERT INTO pcr1_experiment_master_mix_volumes (pcr_experiment_id)
SELECT id
FROM pcr_experiments
WHERE pcr_type = 'dna-preseq-1' OR pcr_type = 'rna-preseq-1'
ON CONFLICT (pcr_experiment_id) DO NOTHING;
