import { pgTable, timestamp, uuid, varchar, smallint, text } from 'drizzle-orm/pg-core'
import { reagents } from './reagents'

export const lots = pgTable('lots', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  lotNumber: varchar('lot_number', { length: 50 }).notNull(),
  reagent: uuid('reagent_id').references(() => reagents.id).notNull(),
  status: text('status', {
    enum: [
      'current',
      'needs_testing',
      'rejected',
      'tested',
      'used'
    ]}
  ),
  startedUseOn: timestamp('started_use_on'),
  endedUseOn: timestamp('ended_use_on'),
  expiresOn: timestamp('expires_on'),
  notes: text('notes'),
})
