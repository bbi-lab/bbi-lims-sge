import { getUserById } from '~/server/services/user-services'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}
    try {
        const selectedUser = await getUserById(id)
        return selectedUser
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
