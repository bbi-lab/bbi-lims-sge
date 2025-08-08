import { InferSelectModel, sql } from 'drizzle-orm'
import { pgTable, uuid, varchar, text, check, smallint} from 'drizzle-orm/pg-core'
import _ from 'lodash'
import { targets } from './target'

export const linearizationPrimers = pgTable('linearization_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    targetId: uuid('target_id').references(() => targets.id),
    name: varchar('name', { length: 255 }).notNull(),
    sequence: varchar('sequence', { length: 255 }).notNull(),
    sequenceType: varchar('sequence_type', {enum: ['forward', 'reverse']}),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]+$'`),
])

export const amplificationPrimers = pgTable('amplification_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    targetId: uuid('target_id').references(() => targets.id),
    name: varchar('name', { length: 255 }).notNull(),
    sequence: varchar('sequence', { length: 255 }).notNull(),
    sequenceType: varchar('sequence_type', {enum: ['forward', 'reverse']}),
    temperature: smallint('temperature'),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]+$'`),
])

export const homologyArmPrimers = pgTable('homology_arm_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    targetId: uuid('target_id').references(() => targets.id),
    name: varchar('name', { length: 255 }).notNull(),
    sequence: varchar('sequence', { length: 255 }),
    sequenceType: varchar('sequence_type', {enum: ['forward', 'reverse']}),
    cloningStrategy: varchar('cloning_strategy', {enum: ['Gibson', 'Golden Gate']}),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]*$'`),
])

export const pcr1Primers = pgTable('pcr_1_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    targetId: uuid('target_id').references(() => targets.id),
    name: varchar('name', { length: 255 }).notNull(),
    sequence: varchar('sequence', { length: 255 }),
    sequenceType: varchar('sequence_type', {enum: ['forward', 'reverse']}),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]*$'`),
])

export const pcr2Primers = pgTable('pcr_2_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    targetId: uuid('target_id').references(() => targets.id),
    name: varchar('name', { length: 255 }).notNull(),
    sequence: varchar('sequence', { length: 255 }),
    sequenceType: varchar('sequence_type', {enum: ['forward', 'reverse']}),
    adapterSequence: varchar('adapter_sequence', { length: 255 }),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]*$'`),
  check("adapter_sequence_check", sql`${table.adapterSequence} ~* '^[actg]*$'`),
])

export const indexPrimers = pgTable('index_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    sequence: varchar('sequence', { length: 255 }).notNull(),
    indexSequence: varchar('index_sequence', { length: 255 }).notNull(),
    primerType: varchar('primer_type', {enum: ['P5', 'P7']}),
    kit: varchar('kit', {enum: ['nextera', 'truseq']}),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]*$'`),
])

export type AmplificationPrimer = InferSelectModel<typeof amplificationPrimers>
export type LinearizationPrimer = InferSelectModel<typeof linearizationPrimers>
export type HomologyArmPrimer = InferSelectModel<typeof homologyArmPrimers>
export type IndexPrimer = InferSelectModel<typeof indexPrimers>
