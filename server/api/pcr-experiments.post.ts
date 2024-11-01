import { insertRecord } from '~/server/services/generic-services'
import { pcrExperiments, schemas, type NewPcrExperiment } from '~/server/db/schema/sge/pcr-experiment'

export default defineEventHandler<{ body: NewPcrExperiment }>(async (event) => {
    try {
        const body = await readBody(event)
        const values = schemas.insertPcrExperimentSchema.parse(body)
        const newRecord = await insertRecord(pcrExperiments, values)
        return newRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
