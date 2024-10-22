import { timestamps } from '~/server/db/helpers/columns'
import { dateSchema, nullableDateSchema } from '~/server/db/helpers/schemas'
// import { users } from '@/server/db/schema/user'
import { type InferSelectModel, relations } from 'drizzle-orm'
import { boolean, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z } from 'zod'

export const specimenTypeEnum = pgEnum('specimen_types', ['A', 'B', 'C'])

export const specimens = pgTable('specimens', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  specimenType: specimenTypeEnum('specimen_type').default('A').notNull(),
  ...timestamps,
  // createdBy: uuid('created_by').references(() => users.id),
  // updatedBy: uuid('updated_by').references(() => users.id),
  // deletedBy: uuid('deleted_by').references(() => users.id),
})

// export const specimensRelationsConfig: Record<string, Record<string, any>> = {
//   createdBy: {
//     fields: [specimens.createdBy],
//     referenceTable: users,
//     references: [users.id],
//   },
//   updatedBy: {
//     fields: [specimens.createdBy],
//     referenceTable: users,
//     references: [users.id],
//   },
//   deletedBy: {
//     fields: [specimens.createdBy],
//     referenceTable: users,
//     references: [users.id],
//   },
// }

// export const specimensRelations = relations(specimens, ({ one }) => (
//   _.mapValues(specimensRelationsConfig, (x) => {
//     return one(x.referenceTable, {
//       fields: x.fields,
//       references: x.references,
//     })
//   })
// ))

export const selectSpecimenSchema = createSelectSchema(specimens)

export const updateSpecimenSchema = createSelectSchema(
  specimens, 
  {
    createdAt: dateSchema,
    updatedAt: dateSchema,
    deletedAt: dateSchema,
  }
).omit({ id: true }).partial()

export const insertSpecimenSchema = selectSpecimenSchema.pick({
    name: true,
})

export const deleteSpecimenSchema = z.object({
  body: selectSpecimenSchema.pick({
    id: true,
  }),
})

export type Specimen = InferSelectModel<typeof specimens>
export type NewSpecimen = z.infer<typeof insertSpecimenSchema>
export type UpdateSpecimen = z.infer<typeof updateSpecimenSchema>
export type DeleteSpecimen = z.infer<typeof deleteSpecimenSchema>
