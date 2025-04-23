import { sql, type InferSelectModel } from 'drizzle-orm'
import { pgTable, uuid, smallint, primaryKey, unique, check} from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { plates } from './plate'
import { amplificationPrimers, homologyArmPrimers, linearizationPrimers } from './primer'
import { nucleicAcids } from './nucleic-acid'

export const wells = pgTable('wells', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  plateId: uuid('plate_id').references(() => plates.id).notNull(),
  x: smallint().notNull(),
  y: smallint().notNull(),
  amplificationPrimerId: uuid('amplification_primer_id').references(() => amplificationPrimers.id).unique(),
  linearizationPrimerId: uuid('linearization_primer_id').references(() => linearizationPrimers.id).unique(),
  homologyArmPrimerId: uuid('homology_arm_primer_id').references(() => homologyArmPrimers.id).unique(),
}, (t) => [
  unique('unique_plate_coord').on(t.plateId, t.x, t.y),
  check('one_item_per_well', sql`num_nonnulls(${t.amplificationPrimerId}, ${t.linearizationPrimerId}, ${t.homologyArmPrimerId}) <= 1`),
])

export const wellContents = pgTable('well_contents', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  wellId: uuid('well_id').references(() => wells.id).notNull(),
  amplificationPrimerId: uuid('amplification_primer_id').references(() => amplificationPrimers.id),
  linearizationPrimerId: uuid('linearization_primer_id').references(() => linearizationPrimers.id),
  homologyArmPrimerId: uuid('homology_arm_primer_id').references(() => homologyArmPrimers.id),
  nucleicAcidId: uuid('nucleic_acid_id').references(() => nucleicAcids.id),
}, (t) => [
  check('one_item_per_well_content', sql`num_nonnulls(${t.amplificationPrimerId}, ${t.linearizationPrimerId}, ${t.homologyArmPrimerId}, ${t.nucleicAcidId}) = 1`),
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
