import { selectRecords, selectRecordsFromView } from '~/server/services/generic-services'
import _ from 'lodash'
import { type QueryParams, type SelectParams, queryToSelectParams } from '../../utils/restApi'
import { useDrizzle, schema } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const db = useDrizzle()

    try {
        const body = await readBody(event)
        const queryParams = _.mapValues(body.query || {}, (x) => JSON.stringify(x)) as unknown as QueryParams
        const selectParams = queryToSelectParams(queryParams) as SelectParams

        // requires relevant schema to have been passed on drizzle db init
        return await selectRecords(db.query.haCloningExperiments, selectParams, queryParams.expandEnums == 'true' ? true : false)

    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
