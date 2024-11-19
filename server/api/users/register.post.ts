import { addUser, getUserByEmail } from '~/server/services/user-services'
import { schemas, type NewUser } from '~/server/db/schema/user'
import {isValidPassword} from '~/server/utils/auth'

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

        if (!isValidPassword(values.password)) {
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
