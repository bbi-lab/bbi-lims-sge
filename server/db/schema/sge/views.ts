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
    array_agg(${indexPrimers.id} ORDER BY ${indexPrimers.id}) FILTER (WHERE ${indexPrimers.id} IS NOT NULL) AS index_primer_ids,
    array_agg(${indexPrimers.indexSequence} ORDER BY ${indexPrimers.id}) FILTER (WHERE ${indexPrimers.id} IS NOT NULL) AS index_primer_sequences,
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
