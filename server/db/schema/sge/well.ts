import { type InferSelectModel, relations } from 'drizzle-orm'
import { boolean, pgEnum, pgTable, PgTableWithColumns, AnyPgColumn, uuid, timestamp, smallint, varchar, integer, primaryKey} from 'drizzle-orm/pg-core'
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

export const schemas: Record<string, ZodObject<any>> = {
    selectWellSchema,
}

export type Well = InferSelectModel<typeof wells>
