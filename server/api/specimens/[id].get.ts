import { selectSpecimen } from '~/server/services/specimen-services'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}
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
