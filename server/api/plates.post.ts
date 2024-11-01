import { insertRecord } from '~/server/services/generic-services'
import { plates, schemas, type NewPlate } from '~/server/db/schema/sge/plate'

export default defineEventHandler<{ body: NewPlate }>(async (event) => {
    try {
        const body = await readBody(event)
        const values = schemas.insertPlate.parse(body)
        const newRecord = await insertRecord(plates, values)
        return newRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
