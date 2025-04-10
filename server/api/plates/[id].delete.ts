import { deleteRecord } from '~/server/services/generic-services'
import { eq, or, and, isNotNull } from 'drizzle-orm'
import { plates } from '~/server/db/schema/sge/plate'
import { wells } from '~/server/db/schema/sge/well'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}

    try {
        const nonEmptyWells = await db.select().from(wells).where(
            and(
                eq(wells.plateId, id),
                or(isNotNull(wells.amplificationPrimerId), isNotNull(wells.homologyArmPrimerId), isNotNull(wells.linearizationPrimerId))
            )
        )
        // throw error if wells are not empty
        if (nonEmptyWells.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Plate wells must be empty before deleting'
            })
        }
        // delete wells then plate
        await db.delete(wells).where(eq(wells.plateId, id))
        const deletedRecord = await deleteRecord(plates, id)
        return deletedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
