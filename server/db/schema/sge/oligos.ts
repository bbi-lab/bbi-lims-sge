import { sql } from 'drizzle-orm'
import { pgTable, uuid, varchar, text, check} from 'drizzle-orm/pg-core'
import { targets } from './target'

export const oligos = pgTable('oligos', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    targetId: uuid('target_id').references(() => targets.id),
    name: varchar('name', { length: 255 }).notNull().unique(),
    sequence: varchar('sequence', { length: 255 }),
    direction: varchar('direction', {enum: ['forward', 'reverse']}),
    oligoType: varchar('oligo_type', {enum: ['sgRNA']}),
    notes: text('notes'),
}, (table) => [
  check("sequence_check", sql`${table.sequence} ~* '^[actg]*$'`),
])
