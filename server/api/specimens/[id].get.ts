import { selectSpecimen } from '~/server/services/specimen-services'
import { selecteSpecimenSchema } from '~/server/db/schema/specimen'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params
    try {
        const selectedSpecimen = await selectSpecimen(id)
        return selectedSpecimen
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
