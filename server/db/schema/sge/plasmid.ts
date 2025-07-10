import { pgTable, uuid, varchar, text, doublePrecision, check } from 'drizzle-orm/pg-core'
import { sgRnaCloningExperiments, snvLibCloningExperiments } from './plasmid-experiment'
import { targets } from './target'
import { sql } from 'drizzle-orm'

// export const plasmids = pgTable('plasmids', {
//   id: uuid('id').notNull().primaryKey().defaultRandom(),
//   name: varchar('name', { length: 255 }).notNull().unique(),
//   plasmidType: varchar('plasmid_type', {enum: ['guide', 'library', 'homology arm']}),
//   volume: doublePrecision('volume'),
//   quant: doublePrecision('quant'),
//   targetId: uuid('target_id').references(() => targets.id).notNull(),
//   plasmidExperimentId: uuid('plasmid_experiment_id').references(() => plasmidExperiments.id),
//   verificationStatus: varchar('verification_status', {enum: ['passed', 'failed']}),
//   externalLink: text('external_link'),
//   notes: text('notes'),
// }, (table) => [
//   check("external_link_check", sql`${table.externalLink} ~* '^https?://.+$'`),
// ])

export const sgRnaPlasmids = pgTable('sg_rna_plasmids', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  volume: doublePrecision('volume'),
  quant: doublePrecision('quant'),
  targetId: uuid('target_id').references(() => targets.id).notNull(),
  sgRnaCloningExperimentId: uuid('sg_rna_cloning_experiment_id').references(() => sgRnaCloningExperiments.id),
  verificationStatus: varchar('verification_status', {enum: ['passed', 'failed']}),
  externalLink: text('external_link'),
  notes: text('notes'),
}, (table) => [
  check("external_link_check", sql`${table.externalLink} ~* '^https?://.+$'`),
])

export const snvLibPlasmids = pgTable('snv_lib_plasmids', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  volume: doublePrecision('volume'),
  quant: doublePrecision('quant'),
  targetId: uuid('target_id').references(() => targets.id).notNull(),
  snvLibCloningExperimentId: uuid('snv_lib_cloning_experiment_id').references(() => snvLibCloningExperiments.id),
  verificationStatus: varchar('verification_status', {enum: ['passed', 'failed']}),
  externalLink: text('external_link'),
  notes: text('notes'),
}, (table) => [
  check("external_link_check", sql`${table.externalLink} ~* '^https?://.+$'`),
])
