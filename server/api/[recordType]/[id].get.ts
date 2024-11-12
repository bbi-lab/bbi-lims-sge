import { selectRecord } from '~/server/services/generic-services'
import _ from 'lodash'

export default defineEventHandler(async (event) => {
    const { recordType, id } = event.context.params as {recordType: string, id: string}

    const queryParams = getQuery(event) as QueryParams
    const selectParams = queryToSelectParams(queryParams) as SelectParams
    
    try {
         // requires relevant schema to have been passed on drizzle db init
        const queryBuilder = _.get(db.query, recordType)
        
        if (!queryBuilder) throw createError({
            statusCode: 500, 
            statusMessage: `Could not find queryBuilder, check to make sure ${recordType} is included in drizzle db schemas`
        })
        const table = _.get(queryBuilder, 'table')

        // ignoring any order, limit, or offset params
        const selectedRecord = await selectRecord(queryBuilder, table, id, selectParams.with, selectParams.columns)
        
        return selectedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
