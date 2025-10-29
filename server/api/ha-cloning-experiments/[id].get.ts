import { selectRecord, selectRecordFromView } from '~/server/services/generic-services'
import _ from 'lodash'
import { haCloningExperiments } from '~/server/db/schema/sge/plasmid-experiment'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as { id: string }

    const queryParams = getQuery(event) as QueryParams
    const selectParams = queryToSelectParams(queryParams) as SelectParams

    try {
        const selectedRecord = await selectRecord(db.query.haCloningExperiments, haCloningExperiments, id, selectParams.with, selectParams.columns, queryParams.expandEnums == 'true' ? true : false)
        return selectedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
