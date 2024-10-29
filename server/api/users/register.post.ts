import { addUser } from '~/server/services/user-services'
import { schemas, type NewUser } from '~/server/db/schema/user'

export default defineEventHandler<{ body: NewUser }>(async (event) => {
    try {
        const body = await readBody(event)
        const values = schemas.newUserSchema.parse(body) as NewUser
        const newUser = await addUser(values)
        return newUser
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
