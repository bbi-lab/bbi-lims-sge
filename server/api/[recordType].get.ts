import { selectRecords, selectRecordsFromView } from '~/server/services/generic-services'
import _ from 'lodash'
import { type QueryParams, type SelectParams, queryToSelectParams } from '../utils/restApi'
import { useDrizzle, schema } from '../utils/db'

export default defineEventHandler(async (event) => {
    const { recordType } = event.context.params as {recordType: string}
    const db = useDrizzle()

    try {
        const queryParams = getQuery(event) as QueryParams
        const selectParams = queryToSelectParams(queryParams) as SelectParams
        const viewName = _.snakeCase(queryParams.view)

        // requires relevant schema to have been passed on drizzle db init
        const queryBuilder = _.get(db.query, _.camelCase(recordType))
        if (queryBuilder) {
            return await selectRecords(queryBuilder, selectParams, queryParams.expandEnums == 'true' ? true : false, viewName)
        } else {
            // if the recordType is not found in the queryBuilder, then assume it's a view
            const view = _.get(schema, _.camelCase(recordType))
            if (!view) {
                throw new Error(`Record type ${recordType} not found in queryBuilder or schema`)
            }
            return await selectRecordsFromView(view, selectParams)
        }
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
