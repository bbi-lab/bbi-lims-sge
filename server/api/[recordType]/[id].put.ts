import { updateRecord } from '~/server/services/generic-services'
import _ from 'lodash'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { updateTargets } from '~/server/services/transfect-experiment-services'

export default defineEventHandler(async (event) => {
    const { recordType, id } = event.context.params as {recordType: string, id: string}

    try {
        const body = await readBody(event)
        const updateSchema = schemas[_.camelCase(recordType)].update as ZodObject<any>
        const values = _.mapValues(body, (value) => _.isString(value) && _.isEmpty(value) ? null : value)
        const parsedValues = updateSchema.parse(values)

        // many-to-many
        if (_.camelCase(recordType) == 'transfectExperiments' && _.isArray(body.transfectTargets)) {
            await updateTargets(id, _.map(body.transfectTargets, (x) => x.targetId))
        }

        const updatedRecord = await updateRecord(_.get(db, ['query', _.camelCase(recordType), 'table']), id, parsedValues)

        return updatedRecord
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
