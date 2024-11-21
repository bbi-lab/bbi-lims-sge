import _ from 'lodash'
import { deleteUser } from '~/server/services/user-services'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}

    const session = await getUserSession(event)
    try {
        if (_.get(session, 'user.isAdmin')) {
            const deletedUser = await deleteUser(id)
            return deletedUser
        } else {
            throw createError({
                statusCode: 401, 
                statusMessage: 'UNAUTHORIZED'
            })
        }
    } catch (e: any) {
        throw createError({
            statusCode: e.statusCode || 400,
            statusMessage: e.message
        })
    }
})
