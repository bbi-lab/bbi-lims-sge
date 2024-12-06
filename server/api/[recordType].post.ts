import _ from 'lodash'
import { insertRecords } from '~/server/services/generic-services'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'

export default defineEventHandler(async (event) => {
    const { recordType } = event.context.params as {recordType: string} 

    try {
        const body = await readBody(event)
        const insertSchema = schemas[_.camelCase(recordType)].insert as ZodObject<any>
        const records = _.map(body, (x) => insertSchema.parse(x) )

        const newRecords = await insertRecords(_.get(db, ['query', _.camelCase(recordType), 'table']), records)
        return newRecords
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
