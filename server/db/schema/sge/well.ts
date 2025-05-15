import { sql, type InferSelectModel } from 'drizzle-orm'
import { pgTable, uuid, smallint, primaryKey, unique, check} from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { plates } from './plate'
import { amplificationPrimers, homologyArmPrimers, indexPrimers, linearizationPrimers } from './primer'
import { nucleicAcids } from './nucleic-acid'
import { pellets } from './pellet'

export const wells = pgTable('wells', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  plateId: uuid('plate_id').references(() => plates.id).notNull(),
  x: smallint().notNull(),
  y: smallint().notNull(),
}, (t) => [
  unique('unique_plate_coord').on(t.plateId, t.x, t.y),
])

export const wellContents = pgTable('well_contents', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  wellId: uuid('well_id').references(() => wells.id).notNull(),
  amplificationPrimerId: uuid('amplification_primer_id').references(() => amplificationPrimers.id).unique(),
  linearizationPrimerId: uuid('linearization_primer_id').references(() => linearizationPrimers.id).unique(),
  homologyArmPrimerId: uuid('homology_arm_primer_id').references(() => homologyArmPrimers.id).unique(),
  indexPrimerId: uuid('index_primer_id').references(() => indexPrimers.id),
  nucleicAcidId: uuid('nucleic_acid_id').references(() => nucleicAcids.id),
  pelletId: uuid('pellet_id').references(() => pellets.id).unique(),
}, (t) => [
  check('one_item_per_well_content', sql`num_nonnulls(${t.amplificationPrimerId}, ${t.linearizationPrimerId}, ${t.homologyArmPrimerId}, ${t.indexPrimerId}, ${t.nucleicAcidId}, ${t.pelletId}) = 1`),
])

const selectWellSchema = createSelectSchema(wells)
const insertWellSchema = z.object({})

export const schemas: Record<string, ZodObject<any>> = {
    selectWellSchema,
    insertWellSchema
}

export type Well = InferSelectModel<typeof wells>
export type NewWell = z.infer<typeof insertWellSchema>

export type WellContent = InferSelectModel<typeof wellContents>
