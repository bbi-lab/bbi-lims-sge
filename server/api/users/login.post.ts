import { getUserByEmail } from '~/server/services/user-services'
import { schemas, type LoginUser } from '~/server/db/schema/user'
import argon2 from 'argon2'
import _ from 'lodash'

export default defineEventHandler<{ body: LoginUser }>(async (event) => {
    try {
        const body = await readBody(event)
        const values = schemas.loginSchema.parse(body)
        const existingUser = await getUserByEmail(values.email)

        if (!existingUser) {
            throw createError({
                statusCode: 404,
                statusMessage: 'USER NOT FOUND'
            })
        } else if (!existingUser.isVerified) {
            throw createError({
                statusCode: 401,
                statusMessage: 'NOT VERIFIED',
                message: 'Pending verification'
            })
        }

        const matchPassword = await argon2.verify(
            existingUser.password,
            values.password
        )
        if (!matchPassword) {
            throw createError({
                statusCode: 400,
                statusMessage: 'INVALID PASSWORD'
            })
        }
        const tokens = generateTokens(existingUser.id)
        const sessionUser = _.omit(existingUser, ['password', 'code'])
        await setUserSession(event, {user: sessionUser, secure: tokens, loggedInAt: new Date()})
        return {success: true}
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
