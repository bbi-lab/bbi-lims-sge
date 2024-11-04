import { type InferSelectModel, relations } from 'drizzle-orm'
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

export const wellsRelationsConfig: RelationsConfig = {
  one:{
    plateId: {
      fields: [wells.plateId],
      referenceTable: plates,
      references: [plates.id],
    },
  },
  many: {
  }
}

export const wellsRelations = relations(wells, ({ one }) => (
  _.mapValues(wellsRelationsConfig.one, (x) => {
    return one(x.referenceTable, {
      fields: x.fields,
      references: x.references,
    })
  })
))

export const platesRelationsConfig: RelationsConfig = {
  one:{
  },
  many: {
    wells: {
      table: wells,
      schema: createSelectSchema(wells),
      fields: [wells.plateId],
      relationsConfig: {one:{}, many:{}}
    }
  }
}

export const platesRelations = relations(plates, ({ many }) => (
  _.mapValues(platesRelationsConfig.many, (x) => {
    return many(x.table)
  })
))

const selectWellSchema = createSelectSchema(wells)
const insertWellSchema = z.object({})

export const schemas: Record<string, ZodObject<any>> = {
    selectWellSchema,
    insertWellSchema
}

export type Well = InferSelectModel<typeof wells>
export type NewWell = z.infer<typeof insertWellSchema>
