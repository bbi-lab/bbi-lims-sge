import { getUserById } from '~/server/services/user-services'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}

    const { with: withClause } = getQuery(event) as {with: string}
    const withClauseObj = withClause ? JSON.parse(withClause) : undefined

    try {
        const selectedUser =  await getUserById(id, withClauseObj)
        return selectedUser
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
