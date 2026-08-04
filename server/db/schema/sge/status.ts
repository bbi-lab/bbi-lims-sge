import { pgEnum } from 'drizzle-orm/pg-core'
import { RECORD_STATUSES } from './enum-lookups'

export type RecordStatus = 'not-started' | 'in-progress' | 'on-hold' | 'next-step-ready' | 'complete' | 'discarded'

export const recordStatusEnum = pgEnum('record_statuses', Object.keys(RECORD_STATUSES) as [RecordStatus, ...RecordStatus[]])
