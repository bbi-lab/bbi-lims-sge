import { selectGeneGroups } from '~/server/services/gene-group-services'
import _ from 'lodash'

export default defineEventHandler(async (event) => {
    // value of q should be JSON Logic formatted condition as string
    const { q } = getQuery(event) as {q: string}
    
    try {
        const whereClause = q ? JSON.parse(q) : null
        return await selectGeneGroups(whereClause)
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
