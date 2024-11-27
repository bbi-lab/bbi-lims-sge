import { type InferSelectModel } from 'drizzle-orm'
import { pgTable, PgTableWithColumns, timestamp, uuid, numeric, integer, varchar } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { z, ZodObject } from 'zod'
import { users } from '../user'
import { targets } from './target'
import { dateSchema } from '../../helpers/schemas'

export const transfectExperiments: PgTableWithColumns<any> = pgTable('transfect_experiments', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  technician: uuid('technician').references(() => users.id),
  startedOn: timestamp('started_on').defaultNow(),
})

export const transfectTargets: PgTableWithColumns<any> = pgTable('transfect_targets', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  experimentId: uuid('experiment_id').references(() => transfectExperiments.id).notNull(),
  targetId: uuid('target_id').references(() => targets.id).notNull(),
  snvLibraryConc: numeric('snv_library_conc'),
  snvLibraryTo3ugVol: numeric('snv_library_to_3ug_vol'),
  sgRna: varchar('sg_rna', { length: 255 }),
  sgRnaConc: numeric('sg_rna_conc'),
  sgRnaTo12ugVol: numeric('sg_rna_to_12ug_vol'),
  sgRnaNegControl: varchar('sg_rna_neg_control', { length: 255 }),
  hprt1SgRnaConc: numeric('hprt1_sg_rna_conc'),
  hprt1SgRnaTo12ugVol: numeric('hprt1_sg_rna_to_12ug_vol'),
  xfectBuffer: numeric('xfect_buffer'),
  xfectPolymerPerTransfect: numeric('xfect_polymer_per_transfect'),
  transfectionCount: integer('transfection_Count'),
  snvLibNeeded: numeric('snv_lib_needed'),
  sgRnaNeeded: numeric('sg_rna_needed'),
})
