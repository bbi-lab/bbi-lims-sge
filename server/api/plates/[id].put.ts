import { updateRecord } from '~/server/services/generic-services'
import { schemas, plates, type UpdatePlate } from '~/server/db/schema/sge/plate'
import { wells } from '~/server/db/schema/sge/well'
import { eq, and, or, isNotNull} from 'drizzle-orm'
import _ from 'lodash'

export default defineEventHandler<{ body: UpdatePlate }>(async (event) => {
    const { id } = event.context.params as {id: string}
    try {

        const body = await readBody(event)
        const values = schemas.updatePlateSchema.parse(body)

        // only allow plateType to change if wells are empty
        const existingPlate = await db.query.plates.findFirst({where: () => eq(plates.id, id)})
        if (existingPlate && existingPlate.plateType !== values.plateType) {
            const wellsWithContents = await db.query.wells.findMany({
                with: {
                    wellContents: true
                },
                where: () => eq(wells.plateId, id),
            })
            const nonEmptyWell = wellsWithContents.find((well) => !_.isEmpty(well.wellContents))
            if (nonEmptyWell) {
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
