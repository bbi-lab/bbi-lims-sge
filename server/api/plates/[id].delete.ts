import { deleteRecord } from '~/server/services/generic-services'
import { plates } from '~/server/db/schema/sge/plate'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}    
    // const numberTest = /^\d*$/.test(id)
    // const recordId = numberTest ? parseInt(id) : id
    
    try {
        const deletedRecord = await deleteRecord(plates, id)
        return deletedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
