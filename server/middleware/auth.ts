import _ from 'lodash'

export default defineEventHandler(async (event) => {
    if (event.method == 'POST' && ['/api/users/login', '/api/users/register'].includes(event.path)) return

    let session = null
    let accessToken = null
    let refreshToken = null

    const headers = getHeaders(event)
    
    if (headers.authorization) {
        // to support standard REST API requests using access token
        if (!headers.authorization.startsWith('Bearer ')) {
            throw createError({
                statusCode: 401,
                statusMessage: 'UNAUTHORIZED'
            })
        }
        accessToken = headers.authorization.split(' ')[1]
    } else {
        // to support sessions stored in cookies (via nuxt-auth-utils)
        session = await getUserSession(event)
        if (session) {
            accessToken = _.get(session.secure, 'accessToken')
            refreshToken = _.get(session.secure, 'refreshToken')
        }
    }

    if (!accessToken) {
        await clearUserSession(event)
    } else {
        try {
            verifyToken(accessToken)
        } catch (err: any) {
            // if expired, attempt token refresh and update user session
            if (session && err.statusCode == '401' && err.message == 'TOKEN EXPIRED' && refreshToken) {
                const result = refreshTokens(refreshToken)
                if (!result.authenticated) {
                    // clear session if refresh token is invalid or expired
                    await clearUserSession(event)
                } else if (session) {
                    // add new access and refresh tokens to the session
                    await setUserSession(event, {...session, secure: result})
                    console.log('Refreshed tokens')
                }
            } else {
                if (session) await clearUserSession(event)
                throw err
            }
        }
    }
})
