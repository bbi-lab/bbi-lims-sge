import { pgView, smallint, uuid, varchar } from "drizzle-orm/pg-core";
import { wellContents } from "./well"
import { indexPrimers } from "./primer"
import { nucleicAcids } from "./nucleic-acid"
import { pellets } from "./pellet"
import { wells } from "./well"
import { plates } from "./plate"
import { sql } from "drizzle-orm"
import { sequencingRuns } from "./sequencing-run"

export const viewSequencingRunWellContents = pgView('view_sequencing_run_well_contents', {
  id: uuid('id'),
  wellX: smallint('well_x'),
  wellY: smallint('well_y'),
  plateId: uuid('plate_id'),
  plateName: varchar('plate_name'),
  sequencingRunId: uuid('sequencing_run_id'),
  sequencingRunName: varchar('sequencing_run_name'),
  indexPrimerIds: uuid('index_primer_ids').array(),
  indexPrimerSequences: varchar('index_primer_sequences').array(),
  nucleicAcidIds: uuid('nucleic_acid_ids').array(),
  pelletNames: varchar('pellet_names').array(),
}).as(sql`SELECT
    ${wells.id} as id,
    ${wells.x} as well_x,
    ${wells.y} as well_y,
    ${plates.id} as plate_id,
    ${plates.name} as plate_name,
    ${sequencingRuns.id} AS sequencing_run_id,
    ${sequencingRuns.name} AS sequencing_run_name,
    array_agg(${indexPrimers.id} ORDER BY ${indexPrimers.primerType}) FILTER (WHERE ${indexPrimers.id} IS NOT NULL) AS index_primer_ids,
    array_agg(${indexPrimers.indexSequence} || ' (' || ${indexPrimers.primerType} || ')' ORDER BY ${indexPrimers.primerType}) FILTER (WHERE ${indexPrimers.id} IS NOT NULL) AS index_primer_sequences,
    array_agg(${nucleicAcids.id} ORDER BY ${nucleicAcids.id}) FILTER (WHERE ${nucleicAcids.id} IS NOT NULL) AS nucleic_acid_ids,
    array_agg(${pellets.name} ORDER BY ${nucleicAcids.id}) FILTER (WHERE ${nucleicAcids.id} IS NOT NULL) AS pellet_names
    FROM ${wellContents}
      LEFT JOIN ${indexPrimers} ON  ${wellContents.indexPrimerId} = ${indexPrimers.id}
      LEFT JOIN ${nucleicAcids} ON ${wellContents.nucleicAcidId} = ${nucleicAcids.id}
      LEFT JOIN ${pellets} ON ${nucleicAcids.pelletId} = ${pellets.id}
      JOIN ${wells} ON ${wellContents.wellId} = ${wells.id}
      JOIN ${plates} ON ${wells.plateId} = ${plates.id}
      JOIN ${sequencingRuns} ON ${plates.sequencingRunId} = ${sequencingRuns.id}
  WHERE ${sequencingRuns.status} IN ('pending', 'running')
  GROUP BY ${wells.id}, ${plates.id}, ${sequencingRuns.id}`)

export const viewSequencingRunErrors = pgView('view_sequencing_run_errors', {
  id: uuid('id'),
  errorMessages: varchar('error_messages').array(),
}).as(sql`SELECT
    sequencing_run_id as id,
    array_agg(error_msg) as error_messages from (
	    WITH sequencing_run_well_contents as (
        SELECT
            ${sequencingRuns.id} AS sequencing_run_id,
            array_agg(${indexPrimers.id} ORDER BY ${indexPrimers.primerType}) FILTER (WHERE ${indexPrimers.id} IS NOT NULL) AS index_primer_ids,
            array_agg(${nucleicAcids.id} ORDER BY ${nucleicAcids.id}) FILTER (WHERE ${nucleicAcids.id} IS NOT NULL) AS nucleic_acid_ids
          FROM ${wellContents}
            LEFT JOIN ${indexPrimers} ON ${wellContents.indexPrimerId} = ${indexPrimers.id}
            LEFT JOIN ${nucleicAcids} ON ${wellContents.nucleicAcidId} = ${nucleicAcids.id}
            JOIN ${wells} ON ${wellContents.wellId} = ${wells.id}
            JOIN ${plates} ON ${wells.plateId} = ${plates.id}
            JOIN ${sequencingRuns} ON ${plates.sequencingRunId} = ${sequencingRuns.id}
          GROUP BY ${wells.id}, ${sequencingRuns.id}
      )
      select sequencing_run_id, 'Repeated index primers' as error_msg from (
        select sequencing_run_id,  index_primer_ids, count(*) as index_primer_count
        from sequencing_run_well_contents
        where index_primer_ids IS NOT NULL
        group by sequencing_run_id, index_primer_ids)
      where index_primer_count > 1
      UNION
      Select sequencing_run_id, 'Missing index primers' as error_msg FROM sequencing_run_well_contents WHERE index_primer_ids is NULL
      UNION
      Select sequencing_run_id, 'Too many index primers in well' as error_msg FROM sequencing_run_well_contents WHERE cardinality(index_primer_ids) > 2
      UNION
      Select sequencing_run_id, 'Missing nucleic acids' as error_msg FROM sequencing_run_well_contents WHERE nucleic_acid_ids is NULL
      UNION
      Select sequencing_run_id, 'Too many nucleic acids in well' as error_msg FROM sequencing_run_well_contents WHERE cardinality(nucleic_acid_ids) > 1
) group by sequencing_run_id`)
