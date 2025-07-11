import { updateRecord } from '~/server/services/generic-services'
import _ from 'lodash'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { updateTargets } from '~/server/services/transfect-experiment-services'
import { parsePutPostError } from '~/server/utils/restApi'

export default defineEventHandler(async (event) => {
    const { recordType, id } = event.context.params as {recordType: string, id: string}
    if (recordType != _.kebabCase(recordType)) {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid record type: ${recordType}. Record type must be kebab-case.`
        })
    }

    try {
        const body = await readBody(event)
        const updateSchema = schemas[_.camelCase(recordType)].update as ZodObject<any>
        const values = _.mapValues(body, (value) => _.isString(value) && _.isEmpty(value) ? null : value)
        const parsedValues = updateSchema.parse(values)

        // many-to-many
        if (_.camelCase(recordType) == 'transfectExperiments' && _.isArray(body.transfectTargets)) {
            const transfectionTargets = _.map(body.transfectTargets, (x) => {
                return {
                    id: x.id,
                    targetId: x.targetId,
                    transfectionCount: x.transfectionCount,
                    negativeControl: x.negativeControl
                }
            })
            await updateTargets(id, transfectionTargets)
        }

        const updatedRecord = await updateRecord(_.get(db, ['query', _.camelCase(recordType), 'table']), id, parsedValues)

        return updatedRecord
    } catch (e: any) {
        const { error, data } = parsePutPostError(e, recordType)

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
            data
        })
    }
})
