import { type InferSelectModel, count, eq, sql } from 'drizzle-orm'
import { pgTable, pgView, QueryBuilder, smallint, uuid, varchar, boolean, check } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { pcrExperiments } from './pcr-experiment'
import { ENUM_LOOKUPS } from './enum-lookups'
import { wellContents, wellContentSources, wells } from './well'
import { transfectExperiments, transfectTargets } from './transfect-experiment'
import { cycles } from './cycle'
import { targets } from './target'
import { sequencingRuns } from './sequencing-run'

export type PlateType = 'pellet-storage' | 'amp-storage' | 'lin-storage' | 'ha-storage' | 'guide-rna-storage' | 'guide-rna' | 'amp-pcr' | 'lin-pcr' | 'ha-pcr' | 'preseq-1' | 'preseq-2' | 'preseq-3' | 'snv-lib-preseq-2' | 'snv-lib-preseq-3' | 'seq-index'

export const plates = pgTable('plates', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  pcrExperimentId: uuid('pcr_experiment_id').references(() => pcrExperiments.id),
  name: varchar('name', { length: 255 }).notNull().unique(),
  sizeX: smallint('size_x').notNull().default(12),
  sizeY: smallint('size_y').notNull().default(8),
  plateType: varchar('plate_type', { enum: Object.keys(ENUM_LOOKUPS.plates.plateType) as [PlateType, ...PlateType[]] }).notNull(),
  discarded: boolean('discarded').default(false),
  processed: boolean('processed').default(false),
  sequencingRunId: uuid('sequencing_run_id').references(() => sequencingRuns.id),
}, (t) => [
  check("sequencing_run_plate_type_check", sql`(${t.sequencingRunId} IS NULL AND ${t.plateType} != 'preseq-3') OR ${t.plateType} = 'preseq-3'`),
])

const qb = new QueryBuilder()

// create a CTE for plate types from ENUM_LOOKUPSto use in view
const plateTypesAsSqlValues = _.map(ENUM_LOOKUPS.plates.plateType, (value, key) => {
  return `('${key}', '${value.label}', '${value.desc}')`
})
const plateTypesCte = `with plate_types(plate_type_value, plate_type_label, plate_type_desc) AS (VALUES ${plateTypesAsSqlValues.join(', ')})`

export const viewPlatesWithWellCounts = pgView('view_plates_with_well_counts', {
  id: uuid('id'),
  pcrExperimentId: uuid('pcr_experiment_id'),
  name: varchar('name', { length: 255 }),
  sizeX: smallint('size_x'),
  sizeY: smallint('size_y'),
  plateType: varchar('plate_type'),
  discarded: boolean('discarded'),
  processed: boolean('processed'),
  cycleId: varchar('cycle_id'),
  cycleName: varchar('cycle_name'),
  targets: varchar('targets'),
  plateTypeLabel: varchar('plate_type_label'),
  wellsCount: smallint('wells_count'),
  wellsWithContentCount: smallint('wells_with_content_count'),
  wellsProcessedCount: smallint('wells_processed_count'),
  sequencingRunName: varchar('sequencing_run_name'),
}).as(sql`${sql.raw(plateTypesCte)} select
    ${plates.id},
    ${plates.pcrExperimentId},
    ${plates.name},
    ${plates.sizeX},
    ${plates.sizeY},
    ${plates.plateType},
    ${plates.discarded},
    ${plates.processed},
    ${cycles.id} as cycle_id,
    ${cycles.name} as cycle_name,
    string_agg(distinct ${targets.name}, ',') as targets,
    (select distinct on (plate_type_value) plate_type_label from plate_types where plate_type_value = ${plates.plateType}) as plate_type_label,
    count(distinct(${wells.id})) as wells_count,
    count(distinct(${wellContents.wellId})) as wells_with_content_count,
    count(distinct(${wellContentSources.sourceWellId})) as wells_processed_count,
    (select name from sequencing_runs where ${sequencingRuns.id} = ${plates.sequencingRunId}) as sequencing_run_name
    from ${plates}
    join ${wells} on ${eq(plates.id, wells.plateId)}
    left join ${wellContentSources} on ${eq(wells.id, wellContentSources.sourceWellId)}
    left join ${wellContents} on ${eq(wells.id, wellContents.wellId)}
    left join ${pcrExperiments} on ${eq(plates.pcrExperimentId, pcrExperiments.id)}
    left join ${transfectTargets} on ${eq(pcrExperiments.transfectTargetId, transfectTargets.id)}
    left join ${targets} on ${eq(targets.id, transfectTargets.targetId)}
    left join ${transfectExperiments} on ${eq(transfectTargets.experimentId, transfectExperiments.id)}
    left join ${cycles} on ${eq(transfectExperiments.cycleId, cycles.id)}
    group by ${plates.id}, ${cycles.id}`
)

const selectPlateSchema = createSelectSchema(plates)
const insertPlateSchema = selectPlateSchema.omit({id: true}).partial()
const updatePlateSchema = selectPlateSchema.omit({id: true}).partial()

export const schemas: Record<string, ZodObject<any>> = {
    selectPlateSchema,
    insertPlateSchema,
    updatePlateSchema,
}

export type Plate = InferSelectModel<typeof plates>
export type NewPlate = z.infer<typeof insertPlateSchema>
export type UpdatePlate = z.infer<typeof updatePlateSchema>
