import { timestamps } from '../helpers/columns'
import { dateSchema, nullableDateSchema } from '../helpers/schemas'
import { users } from '../schema/user'
import { type InferSelectModel, relations } from 'drizzle-orm'
import { boolean, pgEnum, pgTable, PgTableWithColumns, AnyPgColumn, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { RelationsConfig } from '../../utils/db'

export const specimenTypeEnum = pgEnum('specimen_types', ['A', 'B', 'C'])

export const specimens: PgTableWithColumns<any> = pgTable('specimens', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  specimenType: specimenTypeEnum('specimen_type').default('A').notNull(),
  ...timestamps,
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by').references(() => users.id),
})

export const specimensRelationsConfig: RelationsConfig = {
  one:{
    createdBy: {
      fields: [specimens.createdBy],
      referenceTable: users,
      references: [users.id],
    },
    updatedBy: {
      fields: [specimens.createdBy],
      referenceTable: users,
      references: [users.id],
    },
    deletedBy: {
      fields: [specimens.createdBy],
      referenceTable: users,
      references: [users.id],
    },
  },
  many: {}
}

export const specimensRelations = relationsConfigToRelations(specimens, specimensRelationsConfig)

const selectSpecimenSchema = createSelectSchema(specimens)

const updateSpecimenSchema = createSelectSchema(
  specimens, 
  {
    createdAt: dateSchema,
    updatedAt: dateSchema,
    deletedAt: dateSchema,
  }
).omit({ id: true }).partial()

const insertSpecimenSchema = selectSpecimenSchema.pick({
    name: true,
})

const deleteSpecimenSchema = z.object({
  body: selectSpecimenSchema.pick({
    id: true,
  }),
})

export const schemas: Record<string, ZodObject<any>> = {
  selectSpecimenSchema,
  updateSpecimenSchema,
  insertSpecimenSchema,
  deleteSpecimenSchema
}

export type Specimen = InferSelectModel<typeof specimens>
export type NewSpecimen = z.infer<typeof insertSpecimenSchema>
export type UpdateSpecimen = z.infer<typeof updateSpecimenSchema>
export type DeleteSpecimen = z.infer<typeof deleteSpecimenSchema>
