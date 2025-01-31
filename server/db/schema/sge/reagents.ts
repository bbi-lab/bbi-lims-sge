import { pgTable, pgEnum, timestamp, uuid, varchar, smallint } from 'drizzle-orm/pg-core'

export const reagentVolumeUnits = pgEnum('reagent_volume_units', [
    'nL', 'µL', 'mL', 'L'
])
export const reagentSoluteUnits = pgEnum('reagent_solute_units', [
    'ng', 'µg', 'mg', 'g'
])

export const reagents = pgTable('reagents', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', {length: 255}).notNull().unique(),
  volumeUnit: reagentVolumeUnits('volume_unit'),
  soluteUnit: reagentSoluteUnits('solute_unit'),
})
