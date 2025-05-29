import { deleteRecord } from '~/server/services/generic-services'
import _ from 'lodash'
import { wellContents } from '~/server/db/schema/sge/well'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}

    try {
        const deletedRecord = await deleteRecord(wellContents, id)
        return deletedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
