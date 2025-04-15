import { selectRecords } from '~/server/services/generic-services'
import _ from 'lodash'
import { type QueryParams, type SelectParams, queryToSelectParams } from '../utils/restApi'
import { useDrizzle } from '../utils/db'

export default defineEventHandler(async (event) => {
    const { recordType } = event.context.params as {recordType: string}
    const db = useDrizzle()

    try {
        const queryParams = getQuery(event) as QueryParams
        const selectParams = queryToSelectParams(queryParams) as SelectParams

        // requires relevant schema to have been passed on drizzle db init
        const queryBuilder = _.get(db.query, _.camelCase(recordType))
        return await selectRecords(queryBuilder, selectParams, queryParams.expandEnums == 'true' ? true : false)
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
