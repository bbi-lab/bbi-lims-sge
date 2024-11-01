import { updateRecord } from '~/server/services/generic-services'
import { schemas, pcrExperiments, type UpdatePcrExperiment } from '~/server/db/schema/sge/pcr-experiment'

export default defineEventHandler<{ body: UpdatePcrExperiment }>(async (event) => {
    const { id } = event.context.params as {id: string}
    try {
        const body = await readBody(event)
        const values = schemas.updatePcrExperimentSchema.parse(body)
        const updatedRecord = await updateRecord(pcrExperiments, id, values)
        return updatedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
