import { selectRecord } from '~/server/services/generic-services'
import _ from 'lodash'

export default defineEventHandler(async (event) => {
    const { recordType, id } = event.context.params as {recordType: keyof typeof db.query, id: string}

    const queryParams = getQuery(event) as QueryParams
    const selectParams = queryToSelectParams(queryParams) as SelectParams
    const viewName = _.snakeCase(queryParams.view)

    try {
         // requires relevant schema to have been passed on drizzle db init
        const queryBuilder = _.get(db.query, _.camelCase(recordType))

        if (!queryBuilder) throw createError({
            statusCode: 500,
            statusMessage: `Could not find queryBuilder, check to make sure ${_.camelCase(recordType)} is included in drizzle db schemas`
        })
        const table = _.get(queryBuilder, 'table')

        // ignoring any order, limit, or offset params
        const selectedRecord = await selectRecord(queryBuilder, table, id, selectParams.with, selectParams.columns, queryParams.expandEnums == 'true' ? true : false, viewName)

        return selectedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
