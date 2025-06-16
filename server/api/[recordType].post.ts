import _ from 'lodash'
import { insertRecords } from '~/server/services/generic-services'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { useDrizzle } from '../utils/db'
import { parsePutPostError } from '../utils/restApi'
import { setRelatedPlates } from '../services/sequencing-run-services'

export default defineEventHandler(async (event) => {
    const { recordType } = event.context.params as {recordType: string}
    if (recordType != _.kebabCase(recordType)) {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid record type: ${recordType}. Record type must be kebab-case.`
        })
    }

    const db = useDrizzle()
    try {
        const body = await readBody(event)
        const insertSchema = schemas[_.camelCase(recordType)].insert as ZodObject<any>
        const records = _.map(body, (x) => {
            const record = _.mapValues(x, (value) => _.isString(value) && _.isEmpty(value) ? null : value)
            return insertSchema.parse(record)
        })

        const newRecords = await insertRecords(_.get(db, ['query', _.camelCase(recordType), 'table']), records)

        // if only one record is inserted and it is a sequencing run, set related plates
        if (_.size(newRecords)==1 && _.camelCase(recordType) == 'sequencingRuns' && _.isArray(body[0].plates)) {
            const plateIds = _.map(body[0].plates, 'id')
            await setRelatedPlates(plateIds, newRecords[0].id)
        }

        return newRecords
    } catch (e: any) {
        const { error, data } = parsePutPostError(e, recordType)

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
            data
        })
    }
})
