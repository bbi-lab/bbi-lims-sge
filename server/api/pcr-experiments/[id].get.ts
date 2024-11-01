import { selectRecord } from '~/server/services/generic-services'
import { schemas, pcrExperiments, type UpdatePcrExperiment } from '~/server/db/schema/sge/pcr-experiment'
import _ from 'lodash'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}

    const queryParams = getQuery(event) as QueryParams
    const selectParams = queryToSelectParams(queryParams) as SelectParams

    try {
        // requires relevant schema to have been passed on drizzle db init
        const queryBuilder = _.get(db.query, 'pcrExperiments')
        
        // ignoring any order, limit, or offset params
        const selectedSpecimen = await selectRecord(queryBuilder, pcrExperiments, id, selectParams.with, selectParams.columns)
        return selectedSpecimen
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
