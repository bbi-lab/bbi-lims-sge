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
export const viewPlatesWithWellCounts = pgView('view_plates_with_well_counts', {
  id: uuid('id'),
  pcrExperimentId: uuid('pcr_experiment_id'),
  name: varchar('name', { length: 255 }),
  sizeX: smallint('size_x'),
  sizeY: smallint('size_y'),
  plateType: varchar('plate_type'),
  wellsCount: smallint('wells_count'),
  wellsWithContentCount: smallint('wells_with_content_count'),
}).as(sql`select
    ${plates.id},
    ${plates.pcrExperimentId},
    ${plates.name},
    ${plates.sizeX},
    ${plates.sizeY},
    ${plates.plateType},
    count(${wells.id}) as wells_count,
    count(${wellContents.wellId}) as wells_with_content_count
    from ${plates} join ${wells} on ${eq(plates.id, wells.plateId)}
    left join ${wellContents} on ${eq(wells.id, wellContents.wellId)} group by ${plates.id}`
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
