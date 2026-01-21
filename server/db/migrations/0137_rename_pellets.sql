-- Custom SQL migration file, rename pellets to include transfection experiment cycle name as suffix --
UPDATE pellets AS p2
SET name = p3.new_name
FROM (
	SELECT p1.id, p1.name || '_' || cycles.name AS new_name
	FROM pellets AS p1
	JOIN transfect_targets ON transfect_targets.id = p1.transfect_target_id
	JOIN transfect_experiments ON transfect_experiments.id = transfect_targets.experiment_id
	JOIN cycles ON cycles.id = transfect_experiments.cycle_id
	WHERE split_part(p1.name, '_', -1) != cycles.name
) AS p3
WHERE p3.id = p2.id
