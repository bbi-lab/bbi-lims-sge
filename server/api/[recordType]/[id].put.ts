import { updateRecord } from '~/server/services/generic-services'
import _ from 'lodash'

export default defineEventHandler(async (event) => {
    const { recordType, id } = event.context.params as {recordType: string, id: string}

    try {
        const body = await readBody(event)
        const query = getQuery(event)
        const updatedRecord = await updateRecord(_.get(db, ['query', recordType, 'table']), id, body)

        return updatedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
