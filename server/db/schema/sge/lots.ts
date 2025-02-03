import { pgTable, pgEnum, timestamp, uuid, varchar, smallint, text } from 'drizzle-orm/pg-core'
import { reagents } from './reagents'

export const lotStatus = pgEnum('lot_statuses', [
    'current',
    'needs_testing',
    'rejected',
    'tested',
    'used',
])

export const lots = pgTable('lots', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  lotNumber: varchar('lot_number', { length: 50 }).notNull(),
  reagent: uuid('reagent_id').references(() => reagents.id).notNull(),
  status: lotStatus('status'),
  startedUseOn: timestamp('started_use_on'),
  endedUseOn: timestamp('ended_use_on'),
  expiresOn: timestamp('expires_on'),
  notes: text('notes'),
})
