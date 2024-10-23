import { insertSpecimen } from '~/server/services/specimen-services'
import { insertSpecimenSchema, type NewSpecimen } from '~/server/db/schema/specimen'

export default defineEventHandler<{ body: NewSpecimen }>(async (event) => {
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
