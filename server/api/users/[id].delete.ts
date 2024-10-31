import { deleteUser } from '~/server/services/user-services'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}
    try {
        const deletedUser = await deleteUser(id)
        return deletedUser
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
