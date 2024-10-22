import { insertSpecimen } from '~/server/services/specimen-services'
import { insertSpecimenSchema } from '~/server/db/schema/specimen'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const values = insertSpecimenSchema.parse(body)
        const newSpecimen = await insertSpecimen(values)
        return newSpecimen
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
