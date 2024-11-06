import { selectRecords } from '~/server/services/generic-services'
import _ from 'lodash'
import { QueryParams, SelectParams, queryToSelectParams } from '../utils/restApi'

import { insertRecord } from '~/server/services/generic-services'
import { schemas } from '~/server/db/schema/sge/zod'
//import { pcrExperiments, schemas, type NewPcrExperiment } from '~/server/db/schema/sge/pcr-experiment'


export default defineEventHandler(async (event) => {
    const { recordType } = event.context.params as {recordType: string} 

    try {
        const body = await readBody(event)
        //const values = schemas.insertPcrExperimentSchema.parse(body)
        //const insertSchema = _.get(schemas, recordType, 'insert')

        //const values = insertSchema.parse(body)
        //console.log(values)

        const newRecord = await insertRecord(_.get(db, ['query', recordType, 'table']), body)
        return newRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})

// export default defineEventHandler(async (event) => {
//     const { recordType } = event.context.params as {recordType: string}    
    
//     try {
//         const queryParams = getQuery(event) as QueryParams
//         const selectParams = queryToSelectParams(queryParams) as SelectParams
        
//         // requires relevant schema to have been passed on drizzle db init
//         const queryBuilder = _.get(db.query, recordType)
//         return await selectRecords(queryBuilder, selectParams)
//     } catch (e: any) {
//         throw createError({
//             statusCode: 400,
//             statusMessage: e.message
//         })
//     }
// })
