import { deleteSpecimen } from '~/server/services/specimen-services'
import { selectSpecimenSchema } from '~/server/db/schema/specimen'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params
    try {
        const deletedSpecimen = await deleteSpecimen(id)
        return deletedSpecimen
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
