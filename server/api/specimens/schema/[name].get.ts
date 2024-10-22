import { getSpecimenSchema } from '~/server/services/specimen-services'

export default defineEventHandler(async (event) => {
    const { name } = event.context.params
    try {
        return getSpecimenSchema(name)
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
