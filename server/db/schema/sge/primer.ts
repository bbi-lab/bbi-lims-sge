import { sql } from 'drizzle-orm'
import { pgTable, uuid, varchar, text, check} from 'drizzle-orm/pg-core'
import _ from 'lodash'

export const linearizationPrimers = pgTable('linearization_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    sequence: varchar('sequence', { length: 255 }).notNull(),
    sequenceType: varchar('sequence_type', {enum: ['forward', 'reverse']}),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]+$'`),
])

export const amplificationPrimers = pgTable('amplification_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    sequence: varchar('sequence', { length: 255 }).notNull(),
    sequenceType: varchar('sequence_type', {enum: ['forward', 'reverse']}),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]+$'`),
])

export const homologyArmPrimers = pgTable('homology_arm_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    sequence: varchar('sequence', { length: 255 }).notNull(),
    sequenceType: varchar('sequence_type', {enum: ['forward', 'reverse']}),
    cloningStrategy: varchar('cloning_strategy', {enum: ['Gibson', 'Golden Gate']}),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]+$'`),
])
