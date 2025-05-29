import { sql, type InferSelectModel } from 'drizzle-orm'
import { pgTable, uuid, smallint, primaryKey, unique, check, timestamp} from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { plates } from './plate'
import { amplificationPrimers, homologyArmPrimers, indexPrimers, linearizationPrimers } from './primer'
import { nucleicAcids } from './nucleic-acid'
import { pellets } from './pellet'
import { users } from '../user'

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

export const wellContentSources = pgTable('well_content_sources', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  wellContentId: uuid('well_content_id').references(() => wellContents.id).notNull(),
  sourceWellId: uuid('source_well_id').references(() => wells.id).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
}, (t) => [
  unique('unique_well_content_id_source_well_id').on(t.wellContentId, t.sourceWellId),
])

export const wellSources = pgTable('well_sources', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  sourceWellId: uuid('source_well_id').references(() => wells.id).notNull(),
  destWellId: uuid('dest_well_id').references(() => wells.id).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
}, (t) => [
  unique('unique_well_source_dest').on(t.sourceWellId, t.destWellId),
])

const selectWellSchema = createSelectSchema(wells)
const insertWellSchema = z.object({})

export const schemas: Record<string, ZodObject<any>> = {
    selectWellSchema,
    insertWellSchema
}

const selectWellContentSchema = createSelectSchema(wellContents)
const insertWellContentSchema = selectWellContentSchema.omit({id: true}).partial()

export const wellContentSchemas: Record<string, ZodObject<any>> = {
    selectWellContentSchema,
    insertWellContentSchema
}
export type Well = InferSelectModel<typeof wells>
export type NewWell = z.infer<typeof insertWellSchema>

export type WellContent = InferSelectModel<typeof wellContents>
export type NewWellContent = z.infer<typeof insertWellContentSchema>
