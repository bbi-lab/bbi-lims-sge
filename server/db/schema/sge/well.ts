import { type InferSelectModel } from 'drizzle-orm'
import { pgTable, PgTableWithColumns, uuid, smallint, primaryKey} from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { plates } from './plate'

export const wells: PgTableWithColumns<any> = pgTable('wells', {
  plateId: uuid('plate_id').references(() => plates.id),
  x: smallint().notNull(),
  y: smallint().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.plateId, t.x, t.y] }),
}))


const selectWellSchema = createSelectSchema(wells)
const insertWellSchema = z.object({})

export const schemas: Record<string, ZodObject<any>> = {
    selectWellSchema,
    insertWellSchema
}

export type Well = InferSelectModel<typeof wells>
export type NewWell = z.infer<typeof insertWellSchema>
