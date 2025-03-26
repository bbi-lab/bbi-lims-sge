import _ from 'lodash'
import { insertRecords } from '~/server/services/generic-services'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { useDrizzle } from '../utils/db'

export default defineEventHandler(async (event) => {
    const { recordType } = event.context.params as {recordType: string}
    const db = useDrizzle()
    try {
        const body = await readBody(event)
        const insertSchema = schemas[_.camelCase(recordType)].insert as ZodObject<any>
        const records = _.map(body, (x) => {
            const record = _.mapValues(x, (value) => _.isString(value) && _.isEmpty(value) ? null : value)
            return insertSchema.parse(record)
        })

        const newRecords = await insertRecords(_.get(db, ['query', _.camelCase(recordType), 'table']), records)
        return newRecords
    } catch (e: any) {
        let data
        try {
            data = JSON.parse(e.message)
        } catch (err) {
            data = {}
        }
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
            data
        })
    }
})
