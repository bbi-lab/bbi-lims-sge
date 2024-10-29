import { getUserByUserId } from '~/server/services/user-services'
import { schemas } from '~/server/db/schema/user'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}
    try {
        const selectedUser = await getUserByUserId(id)
        return selectedUser
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
