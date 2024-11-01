import { deleteRecord } from '~/server/services/generic-services'
import { pcrExperiments } from '~/server/db/schema/sge/pcr-experiment'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}    
    const numberTest = /^\d*$/.test(id)
    const recordId = numberTest ? parseInt(id) : id
    
    try {
        const deletedSpecimen = await deleteRecord(pcrExperiments, recordId)
        return deletedSpecimen
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
