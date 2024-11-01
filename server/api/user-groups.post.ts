import { addUserGroup } from '~/server/services/user-services'
import { userGroupSchemas, type NewUserGroup } from '~/server/db/schema/user'

export default defineEventHandler<{ body: NewUserGroup }>(async (event) => {
    try {
        const body = await readBody(event)
        const values = userGroupSchemas.newUserGroupSchema.parse(body) as NewUserGroup
        const newUserGroup = await addUserGroup(values)
        return newUserGroup
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
