import _ from 'lodash'
import { insertRecord } from '~/server/services/generic-services'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'

export default defineEventHandler(async (event) => {
    const { recordType } = event.context.params as {recordType: string} 

    try {
        const body = await readBody(event)
        const insertSchema = schemas[recordType].insert as ZodObject<any>
        const values = insertSchema.parse(body)

        const newRecord = await insertRecord(_.get(db, ['query', recordType, 'table']), values)
        return newRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
