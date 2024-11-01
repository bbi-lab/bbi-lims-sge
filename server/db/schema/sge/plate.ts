import { type InferSelectModel, relations } from 'drizzle-orm'
import { boolean, pgEnum, pgTable, PgTableWithColumns, AnyPgColumn, text, timestamp, uuid, varchar, integer, primaryKey} from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { pcrExperiments } from './pcr-experiment'

export const plates: PgTableWithColumns<any> = pgTable('plates', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  pcrExperimentId: uuid('pcr_experiment_id').references(() => pcrExperiments.id),
  name: varchar('name', { length: 255 }),
})

const selectPlateSchema = createSelectSchema(plates)

export const schemas: Record<string, ZodObject<any>> = {
    selectPlateSchema,
}

export type Plate = InferSelectModel<typeof plates>
