// import { type InferSelectModel, eq, sql } from 'drizzle-orm'
import { pgTable, smallint, uuid, varchar, boolean } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { pcrExperiments } from './pcr-experiment'
import { ENUM_LOOKUPS } from './enum-lookups'
import { sgRnaCloningExperiments } from './plasmid-experiment'
import { type InferSelectModel } from 'drizzle-orm/table'

export type PlateType = 'pellet-storage' |
 'amp-primer-storage' |
 'lin-primer-storage' |
 'ha-primer-storage' |
 'ha-puc19-primer-storage' |
 'sg-rna-oligo-storage' |
 'sg-rna-oligo' |
 'sg-rna-plasmid' |
 'amp-pcr' |
 'lin-pcr' |
 'ha-pcr' |
 'preseq-1' |
 'preseq-2' |
 'preseq-3' |
 'snv-lib-preseq-2' |
 'snv-lib-preseq-3' |
 'seq-index' |
 'pcr1-primer-storage' |
 'pcr2-primer-storage' |
 'external-sample-indexing' |
 'ha-pcr-product-storage' |
 'ha-puc19-pcr-product-storage' |
 'ha-puc19-gibson-product-storage' |
 'ha-puc19-plasmid-storage' |
 'snv-lib-amp-product-storage' |
 'snv-lib-lin-product-storage' |
 'snv-lib-gibson-product-storage' |
 'snv-lib-plasmid-storage' |
 'snv-lib-clonal-dna-product-storage' |
 'snv-lib-golden-gate-product-storage'

export const plates = pgTable('plates', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  pcrExperimentId: uuid('pcr_experiment_id').references(() => pcrExperiments.id),
  sgRnaCloningExperimentId: uuid('sg_rna_cloning_experiment_id').references(() => sgRnaCloningExperiments.id),
  name: varchar('name', { length: 255 }).notNull().unique(),
  sizeX: smallint('size_x').notNull().default(12),
  sizeY: smallint('size_y').notNull().default(8),
  plateType: varchar('plate_type', { enum: Object.keys(ENUM_LOOKUPS.plates.plateType) as [PlateType, ...PlateType[]] }).notNull(),
  discarded: boolean('discarded').default(false),
  processed: boolean('processed').default(false),
})

const selectPlateSchema = createSelectSchema(plates)
const insertPlateSchema = selectPlateSchema.omit({id: true}).partial()
const updatePlateSchema = selectPlateSchema.omit({id: true}).partial()

export const schemas: Record<string, ZodObject<any>> = {
    selectPlateSchema,
    insertPlateSchema,
    updatePlateSchema,
}

export type Plate = InferSelectModel<typeof plates>
export type NewPlate = z.infer<typeof insertPlateSchema>
export type UpdatePlate = z.infer<typeof updatePlateSchema>
