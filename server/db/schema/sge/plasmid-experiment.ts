import { pgTable, timestamp, uuid, varchar, } from 'drizzle-orm/pg-core'
import { users } from '../user'

// export const plasmidExperiments = pgTable('plasmid_experiments', {
//   id: uuid('id').notNull().primaryKey().defaultRandom(),
//   name: varchar('name', { length: 255 }),
//   experimentType: varchar('experiment_type', {enum: ['sg-rna', 'snv-lib']}).notNull(),
//   technician: uuid('technician').references(() => users.id),
//   startedOn: timestamp('started_on').defaultNow(),
//   temperature: decimal('temperature'),
// })

export const sgRnaCloningExperiments = pgTable('sg_rna_cloning_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  transformedOn: timestamp('transformed_on').defaultNow(),
})

export const snvLibCloningExperiments = pgTable('snv_lib_cloning_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  transformedOn: timestamp('transformed_on').defaultNow(),
})
