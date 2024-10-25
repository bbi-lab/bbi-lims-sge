import { selectSpecimens } from '~/server/services/specimen-services'
import _ from 'lodash'

export default defineEventHandler(async (event) => {
    // value of q should be JSON Logic formatted condition as string
    const { q } = getQuery(event) as {q: string}
    
    try {
        const whereClause = q ? JSON.parse(q) : null
        return await selectSpecimens(whereClause)
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
