import { sql } from 'drizzle-orm/sql'
import { pgTable, uuid, varchar, text, check, smallint, uniqueIndex} from 'drizzle-orm/pg-core'
import _ from 'lodash'
import { targets } from './target'
import { type InferSelectModel } from 'drizzle-orm/table'

export const linearizationPrimers = pgTable('linearization_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    targetId: uuid('target_id').references(() => targets.id),
    name: varchar('name', { length: 255 }).notNull().unique(),
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
    name: varchar('name', { length: 255 }).notNull().unique(),
    sequence: varchar('sequence', { length: 255 }),
    sequenceType: varchar('sequence_type', {enum: ['forward', 'reverse']}),
    cloningStrategy: varchar('cloning_strategy', {enum: ['Gibson', 'Golden Gate']}),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]*$'`),
])

export const homologyArmPrimerTargets = pgTable('homology_arm_primer_targets', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  homologyArmPrimerId: uuid('homology_arm_primer_id').references(() => homologyArmPrimers.id).notNull(),
  targetId: uuid('target_id').references(() => targets.id).notNull(),
}, (t) => [
  uniqueIndex('unique_ha_primer_target').on(t.homologyArmPrimerId, t.targetId),
])

export const homologyArmPuc19Primers = pgTable('homology_arm_puc19_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    homologyArmPrimerId: uuid('homology_arm_primer_id').references(() => homologyArmPrimers.id).notNull(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    sequence: varchar('sequence', { length: 255 }),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]*$'`),
])

export const preseq1Primers = pgTable('preseq_1_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    targetId: uuid('target_id').references(() => targets.id),
    name: varchar('name', { length: 255 }).notNull().unique(),
    sequence: varchar('sequence', { length: 255 }),
    sequenceType: varchar('sequence_type', {enum: ['forward', 'reverse']}),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]*$'`),
])

export const preseq2Primers = pgTable('preseq_2_primers', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    targetId: uuid('target_id').references(() => targets.id),
    name: varchar('name', { length: 255 }).notNull().unique(),
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
    name: varchar('name', { length: 255 }).notNull().unique(),
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
export type HomologyArmPuc19Primer = InferSelectModel<typeof homologyArmPuc19Primers>
export type IndexPrimer = InferSelectModel<typeof indexPrimers>
export type preseq1Primer = InferSelectModel<typeof preseq1Primers>
export type preseq2Primer = InferSelectModel<typeof preseq2Primers>
