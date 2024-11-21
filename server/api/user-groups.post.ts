import { addUserGroup } from '~/server/services/user-services'
import { userGroupSchemas, type NewUserGroup } from '~/server/db/schema/user'
import _ from 'lodash'

export default defineEventHandler<{ body: NewUserGroup }>(async (event) => {
    const session = await getUserSession(event)
    try {
        if (_.get(session, 'user.isAdmin')) {
            const body = await readBody(event)
            const values = userGroupSchemas.newUserGroupSchema.parse(body) as NewUserGroup
            const newUserGroup = await addUserGroup(values)
            return newUserGroup
        } else {
            throw createError({
                statusCode: 401, 
                statusMessage: 'UNAUTHORIZED'
            })
        }
        
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
