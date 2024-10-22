import { updateSpecimen } from '~/server/services/specimen-services'
import { updateSpecimenSchema } from '~/server/db/schema/specimen'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params
    try {
        const body = await readBody(event)
        const values = updateSpecimenSchema.parse(body)
        const updatedSpecimen = await updateSpecimen(id, values)
        return updatedSpecimen
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
