import { changePassword } from '~/server/services/user-services'
import { schemas, type ChangePassword } from '~/server/db/schema/user'
import argon2 from 'argon2'
import _ from 'lodash'
import {isValidPassword} from '~/server/utils/auth'

export default defineEventHandler<{ body: ChangePassword }>(async (event) => {
    try {
        const body = await readBody(event)
        const values = schemas.changePasswordSchema.parse(body)
        
        const session = await getUserSession(event)
        
        const matchPassword = await argon2.verify(
            _.get(session.user, 'password', ''),
            values.oldPassword
        )
        if (!matchPassword) {
            throw createError({
                statusCode: 400,
                statusMessage: 'INVALID PASSWORD'
            })
        }
        if (!isValidPassword(values.newPassword)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Password must be at least 8 characters long and include a combination of uppercase letters, lowercase letters, numbers, and special characters (@$!%*?&)'
            })
        }
        await changePassword(_.get(session.user, 'id', ''), values.newPassword)
        return {success: true}
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
