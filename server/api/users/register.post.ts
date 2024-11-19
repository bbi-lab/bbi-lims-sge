import { addUser, getUserByEmail } from '~/server/services/user-services'
import { schemas, type NewUser } from '~/server/db/schema/user'

export default defineEventHandler<{ body: NewUser }>(async (event) => {
    try {
        const body = await readBody(event)
        const values = schemas.newUserSchema.parse(body) as NewUser

        const existingUser = await getUserByEmail(values.email)

        if (existingUser) {
            throw createError({
                statusCode: 400,
                statusMessage: 'User already exists.'
            })
        }

        // pattern for minimum of 8 characters with at least one uppercase, one lowercase, one number, one special char
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        const validPassword = regex.test(values.password)

        if (!validPassword) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Password must be at least 8 characters long and include a combination of uppercase letters, lowercase letters, numbers, and special characters (@$!%*?&)'
            })
        }
        
        const newUser = await addUser(values)
        return newUser
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
