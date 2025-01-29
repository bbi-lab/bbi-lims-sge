import { pgTable, pgEnum, timestamp, uuid, varchar, smallint } from 'drizzle-orm/pg-core'

export const lotStatus = pgEnum('lot_statuses', [
    'current',
    'needs_testing',
    'rejected',
    'tested',
    'used',
])

export const lots = pgTable('lots', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  material: varchar('name', { length: 255 }),
  status: lotStatus('status'),
  lot_number: smallint('lot_number'),
  startedUseOn: timestamp('started_use_on'),
  endedUseOn: timestamp('ended_use_on'),
  expiresOn: timestamp('expires_on')
})
