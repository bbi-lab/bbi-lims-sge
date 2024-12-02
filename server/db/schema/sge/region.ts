import { pgTable, PgTableWithColumns, uuid, varchar, integer } from 'drizzle-orm/pg-core'
import {sql} from 'drizzle-orm'
import _ from 'lodash'
import {genes} from './gene'

export const regions: PgTableWithColumns<any> = pgTable('regions', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  geneId: uuid('gene_id').references(() => genes.id).notNull(),
  ampliconStart: integer('amplicon_start'),
  ampliconEnd: integer('amplicon_end'),
  ampliconSequence: varchar('amplicon_sequence', {length: 255}),
  snvLibraryStart: integer('snv_library_start'),
  snvLibraryEnd: integer('snv_library_end'),
  fixedEdits: varchar('fixed_edits', { length: 255 }).array(),
})
