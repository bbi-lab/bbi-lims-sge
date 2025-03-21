import { plates, NewPlate} from '~/server/db/schema/sge/plate'
import { wells, NewWell} from '~/server/db/schema/sge/well'

import { db } from '~/server/utils/db'
import _ from 'lodash'

export async function insertPlates(values: NewPlate[]) {
    // wrapping in a transaction to rollback if any inserts fail
    const result = await db.transaction(async (tx) => {
        const newPlates = await tx
        .insert(plates)
        .values(values)
        .returning()
    
        newPlates.forEach(async (newPlate) => {
            for (let x = 1; x <= newPlate.sizeX; x++) {
                for (let y = 1; y <= newPlate.sizeY; y++) {
                    await tx.insert(wells).values({plateId: newPlate.id, x, y})
                }
            }
        })
        return newPlates
    })

    return result
  }
