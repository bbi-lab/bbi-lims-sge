import _ from 'lodash'
import { updateRecords } from '~/server/services/generic-services'
import { useDrizzle } from '../utils/db'
import { parsePutPostError } from '../utils/restApi'
import { schemas, plates } from '~/server/db/schema/sge/plate'

export default defineEventHandler(async (event) => {
    const db = useDrizzle()

    try {
        const {ids, values} = await readBody(event)

        const updateSchema = schemas.updatePlateSchema
        const valuesWithEmptyAsNull = _.mapValues(values, (value) => _.isString(value) && _.isEmpty(value) ? null : value)

        // excludes fields from schema that are not present in incoming values
        const schemaPicks = _.mapValues(values, () => true)

        const parsedValues = updateSchema.pick(schemaPicks).parse(valuesWithEmptyAsNull)

        const updatedRecords = await updateRecords(plates, ids, parsedValues)

        return updatedRecords
    } catch (e: any) {
        const { error, data } = parsePutPostError(e, 'plates')

        throw createError({
            statusCode: 400,
            statusMessage: e.message,
            data
        })
    }
})
