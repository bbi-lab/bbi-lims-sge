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
        const values = updateSchema.parse(body)

        // many-to-many
        // if (_.camelCase(recordType) == 'transfectExperiments' && _.isArray(body.transfectTargets)) {
        //     await updateTargets(id, _.map(body.transfectTargets, (x) => x.targetId))
        // }

        const updatedRecord = await updateRecord(_.get(db, ['query', _.camelCase(recordType), 'table']), id, values)

        return updatedRecord
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
