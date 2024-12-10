import { pgTable, PgTableWithColumns, timestamp, uuid, numeric, integer, varchar, text, doublePrecision } from 'drizzle-orm/pg-core'
import { users } from '../user'
import { targets } from './target'

export const transfectExperiments = pgTable('transfect_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow(),
})

export const transfectTargets = pgTable('transfect_targets', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  experimentId: uuid('experiment_id').references(() => transfectExperiments.id).notNull(),
  targetId: uuid('target_id').references(() => targets.id).notNull(),
  snvLibraryConc: doublePrecision('snv_library_conc'),
  snvLibraryTo3ugVol: doublePrecision('snv_library_to_3ug_vol'),
  sgRna: varchar('sg_rna', { length: 255 }),
  sgRnaConc: doublePrecision('sg_rna_conc'),
  sgRnaTo12ugVol: doublePrecision('sg_rna_to_12ug_vol'),
  sgRnaNegControl: varchar('sg_rna_neg_control', { length: 255 }),
  hprt1SgRnaConc: doublePrecision('hprt1_sg_rna_conc'),
  hprt1SgRnaTo12ugVol: doublePrecision('hprt1_sg_rna_to_12ug_vol'),
  xfectBuffer: doublePrecision('xfect_buffer'),
  xfectPolymerPerTransfect: doublePrecision('xfect_polymer_per_transfect'),
  transfectionCount: integer('transfection_count'),
  snvLibNeeded: doublePrecision('snv_lib_needed'),
  sgRnaNeeded: doublePrecision('sg_rna_needed'),
  notes: text('notes'),
})
