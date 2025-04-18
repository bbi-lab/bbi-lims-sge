import { type InferSelectModel, count, eq, sql } from 'drizzle-orm'
import { pgTable, pgView, QueryBuilder, smallint, uuid, varchar } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { pcrExperiments } from './pcr-experiment'
import { ENUM_LOOKUPS } from './enum-lookups'
import { wellContents, wells } from './well'

export const plates = pgTable('plates', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  pcrExperimentId: uuid('pcr_experiment_id').references(() => pcrExperiments.id),
  name: varchar('name', { length: 255 }).notNull().unique(),
  sizeX: smallint('size_x').notNull().default(12),
  sizeY: smallint('size_y').notNull().default(8),
  plateType: varchar('plate_type', { enum: Object.keys(ENUM_LOOKUPS.plates.plateType) as [string, ...string[]] }).notNull(),
})

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
  plateTypeLabel: varchar('plate_type_label'),
  wellsCount: smallint('wells_count'),
  wellsWithContentCount: smallint('wells_with_content_count'),
}).as(sql`${sql.raw(plateTypesCte)} select
    ${plates.id},
    ${plates.pcrExperimentId},
    ${plates.name},
    ${plates.sizeX},
    ${plates.sizeY},
    ${plates.plateType},
    (select distinct on (plate_type_value) plate_type_label from plate_types where plate_type_value = ${plates.plateType}) as plate_type_label,
    count(${wells.id}) as wells_count,
    count(${wellContents.wellId}) as wells_with_content_count
    from ${plates}
    join ${wells} on ${eq(plates.id, wells.plateId)}
    left join ${wellContents} on ${eq(wells.id, wellContents.wellId)}
    group by ${plates.id}`
)

const selectPlateSchema = createSelectSchema(plates)
const insertPlateSchema = selectPlateSchema.omit({id: true, sizeX: true, sizeY: true})
const updatePlateSchema = selectPlateSchema.omit({id: true})

export const schemas: Record<string, ZodObject<any>> = {
    selectPlateSchema,
    insertPlateSchema,
    updatePlateSchema,
}

export type Plate = InferSelectModel<typeof plates>
export type NewPlate = z.infer<typeof insertPlateSchema>
export type UpdatePlate = z.infer<typeof updatePlateSchema>
