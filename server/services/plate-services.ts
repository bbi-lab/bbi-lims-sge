import { plates, NewPlate} from '~/server/db/schema/sge/plate'
import { wells } from '~/server/db/schema/sge/well'
import _ from 'lodash'
import type { PgTransaction } from 'drizzle-orm/pg-core'

const db = useDrizzle()

export async function insertPlate(values: NewPlate, tx?: PgTransaction<any, any, any>) {
    const newPlate = _.first(await (tx ?? db)
        .insert(plates)
        .values(values)
        .returning()
    )

    if (newPlate) {
        for (let x = 1; x <= newPlate.sizeX; x++) {
            for (let y = 1; y <= newPlate.sizeY; y++) {
                await (tx ?? db).insert(wells).values({plateId: newPlate.id, x, y})
            }
        }
    }

    return newPlate
  }
