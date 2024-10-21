import { getAllSpecimens } from '~/server/services/specimen-services'

export default defineEventHandler(async (event) => {
    try {
        return await getAllSpecimens()
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
