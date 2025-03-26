import _ from 'lodash'
import { updateRecords } from '~/server/services/generic-services'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { useDrizzle } from '../utils/db'

export default defineEventHandler(async (event) => {
    const { recordType } = event.context.params as {recordType: string}
    const db = useDrizzle()

    try {
        const {ids, values} = await readBody(event)

        const updateSchema = schemas[_.camelCase(recordType)].update as ZodObject<any>
        const valuesWithEmptyAsNull = _.mapValues(values, (value) => _.isString(value) && _.isEmpty(value) ? null : value)

        // excludes fields from schema that are not present in incoming values
        const schemaPicks = _.mapValues(values, () => true)
        const parsedValues = updateSchema.pick(schemaPicks).parse(valuesWithEmptyAsNull)

        const updatedRecords = await updateRecords(_.get(db, ['query', _.camelCase(recordType), 'table']), ids, parsedValues)

        return updatedRecords
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
