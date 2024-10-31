import { getAllUsers } from '~/server/services/user-services'

export default defineEventHandler(async (event) => {
    const { with: withClause } = getQuery(event) as {with: string}
    const withClauseObj = withClause ? JSON.parse(withClause) : undefined

    try {
        return await getAllUsers(withClauseObj)
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
