import { adminUpdateUser } from '~/server/services/user-services'
import { schemas, type AdminUpdateUser } from '~/server/db/schema/user'

export default defineEventHandler<{ body: AdminUpdateUser }>(async (event) => {
    const { id } = event.context.params as {id: string}
    try {
        const body = await readBody(event)
        const values = schemas.adminUpdateUserSchema.parse(body) as AdminUpdateUser
        const updatedUser = await adminUpdateUser(id, values)
        return updatedUser
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
