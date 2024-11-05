import { pgTable, PgTableWithColumns, uuid, varchar, integer } from 'drizzle-orm/pg-core'
import _ from 'lodash'
import {targets} from './target'

export const regions: PgTableWithColumns<any> = pgTable('regions', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  targetId: uuid('target_id').references(() => targets.id),
  ncbiReferenceSequenceId: varchar('ncbi_reference_sequence_id', {length: 50}),
  sequencingAmpliconStart: integer('sequencing_amplicon_start'),
  sequencingAmpliconEnd: integer('sequencing_amplicon_end'),
  snvLibraryStart: integer('snv_library_start'),
  snvLibraryEnd: integer('snv_library_end'),
})
