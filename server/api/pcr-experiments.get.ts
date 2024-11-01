import { selectRecords } from '~/server/services/generic-services'
import _ from 'lodash'
import { QueryParams, SelectParams, queryToSelectParams } from '../utils/restApi'

export default defineEventHandler(async (event) => {
    try {
        const queryParams = getQuery(event) as QueryParams
        const selectParams = queryToSelectParams(queryParams) as SelectParams
        
        // requires relevant schema to have been passed on drizzle db init
        const queryBuilder = _.get(db.query, 'pcrExperiments')
        return await selectRecords(queryBuilder, selectParams)
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
