import { type InferSelectModel, relations } from 'drizzle-orm'
import { boolean, pgEnum, pgTable, PgTableWithColumns, type AnyPgColumn, text, timestamp, smallint, uuid, varchar, integer, primaryKey} from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { pcrExperiments } from './pcr-experiment'

export const plates: PgTableWithColumns<any> = pgTable('plates', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  pcrExperimentId: uuid('pcr_experiment_id').references(() => pcrExperiments.id),
  name: varchar('name', { length: 255 }).notNull(),
  sizeX: smallint('size_x').notNull().default(12),
  sizeY: smallint('size_y').notNull().default(8),
})


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
