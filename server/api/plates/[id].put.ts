import { updateRecord } from '~/server/services/generic-services'
import { schemas, plates, type UpdatePlate } from '~/server/db/schema/sge/plate'

export default defineEventHandler<{ body: UpdatePlate }>(async (event) => {
    const { id } = event.context.params as {id: string}
    try {
        const body = await readBody(event)
        const values = schemas.updatePlateSchema.parse(body)
        const updatedRecord = await updateRecord(plates, id, values)
        return updatedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
