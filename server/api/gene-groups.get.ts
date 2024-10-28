import { selectGeneGroups } from '~/server/services/gene-group-services'
import _ from 'lodash'
import { QueryParams, SelectParams, queryToSelectParams } from '../utils/restApi'

export default defineEventHandler(async (event) => {
    try {
        const queryParams = getQuery(event) as QueryParams
        const selectParams = queryToSelectParams(queryParams) as SelectParams
        return await selectGeneGroups(selectParams)
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
