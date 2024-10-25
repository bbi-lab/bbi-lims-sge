import { deleteSpecimen } from '~/server/services/specimen-services'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}
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
