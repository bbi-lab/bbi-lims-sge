import { updateRecord } from '~/server/services/generic-services'
import { schemas, plates, type UpdatePlate } from '~/server/db/schema/sge/plate'
import { wells } from '~/server/db/schema/sge/well'
import { eq, and, or, isNotNull} from 'drizzle-orm'

export default defineEventHandler<{ body: UpdatePlate }>(async (event) => {
    const { id } = event.context.params as {id: string}
    try {

        const body = await readBody(event)
        const values = schemas.updatePlateSchema.parse(body)

        // only allow plateType to change if wells are empty
        const existingPlate = await db.query.plates.findFirst({where: () => eq(plates.id, id)})
        if (existingPlate && existingPlate.plateType !== values.plateType) {
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
                    statusMessage: 'Plate wells must be empty before changing plate type'
                })
            }
        }

        const updatedRecord = await updateRecord(plates, id, values)
        return updatedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
