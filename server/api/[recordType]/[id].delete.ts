import { deleteRecord } from '~/server/services/generic-services'
import _ from 'lodash'

export default defineEventHandler(async (event) => {
    const { recordType, id } = event.context.params as {recordType: string, id: string}

    try {
         // requires relevant schema to have been passed on drizzle db init
        const table = _.get(db, ['query', _.camelCase(recordType), 'table'])
        
        if (!table) throw createError({
            statusCode: 500, 
            statusMessage: `Could not find table, check to make sure ${_.camelCase(recordType)} is included in drizzle db schemas`
        })
        const deletedRecord = await deleteRecord(table, id)

        return deletedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
