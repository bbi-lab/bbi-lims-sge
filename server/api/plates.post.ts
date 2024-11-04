import { insertPlate } from '~/server/services/plate-services'
import { schemas, type NewPlate } from '~/server/db/schema/sge/plate'

export default defineEventHandler<{ body: NewPlate }>(async (event) => {
    try {
        const body = await readBody(event)
        const values = schemas.insertPlateSchema.parse(body)
        const newRecord = await insertPlate(values)
        return newRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
