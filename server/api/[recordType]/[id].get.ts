import { selectRecord, selectRecordFromView } from '~/server/services/generic-services'
import _ from 'lodash'

export default defineEventHandler(async (event) => {
    const { recordType, id } = event.context.params as {recordType: keyof typeof db.query, id: string}

    const queryParams = getQuery(event) as QueryParams
    const selectParams = queryToSelectParams(queryParams) as SelectParams
    const viewName = _.snakeCase(queryParams.view)

    try {
         // requires relevant schema to have been passed on drizzle db init
        const queryBuilder = _.get(db.query, _.camelCase(recordType))

        let selectedRecord
        if (queryBuilder) {
            const table = _.get(queryBuilder, 'table')
            // ignoring any order, limit, or offset params
            selectedRecord = await selectRecord(queryBuilder, table, id, selectParams.with, selectParams.columns, queryParams.expandEnums == 'true' ? true : false, viewName)
        } else {
            // if the recordType is not found in the queryBuilder, then assume it's a view
            const view = _.get(schema, _.camelCase(recordType))
            if (!view) {
                throw new Error(`Record type ${recordType} not found in queryBuilder or schema`)
            }
            selectedRecord = await selectRecordFromView(view, id)
        }
        return selectedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
