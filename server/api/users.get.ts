import { getAllUsers } from '~/server/services/user-services'

export default defineEventHandler(async () => {
    try {
        return await getAllUsers()
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
