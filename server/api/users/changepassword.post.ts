import { changePassword } from '~/server/services/user-services'
import { schemas, type ChangePassword } from '~/server/db/schema/user'
import argon2 from 'argon2'
import _ from 'lodash'

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
        await changePassword(_.get(session.user, 'id', ''), values.newPassword)
        return {success: true}
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
