import { updateRecord } from '~/server/services/generic-services'
import _ from 'lodash'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { parsePutPostError } from '~/server/utils/restApi'
import { updateHomologyArmPrimerTargets, updatePcrExperimentTransfectTargets, updatePreseq1PrimerTargets } from '~/server/utils/sge'

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

        const updatedRecord = await db.transaction(async (tx) => {
            const recordUpdated = await updateRecord(_.get(db, ['query', _.camelCase(recordType), 'table']), id, parsedValues, tx)

            // many-to-many
            if (_.camelCase(recordType) == 'homologyArmPrimers' && _.isArray(body.targets)) {
                const haPrimerTargetIds = _.map(body.targets, 'targetId')
                await updateHomologyArmPrimerTargets(id, haPrimerTargetIds, tx)
            } else if (_.camelCase(recordType) == 'pcrExperiments' && _.isArray(body.pcrExperimentTargets)) {
                const transfectTargetIds = _.map(body.pcrExperimentTargets, 'transfectTargetId')
                await updatePcrExperimentTransfectTargets(id, transfectTargetIds, tx)
            } else if (_.camelCase(recordType) == 'preseq1Primers' && _.isArray(body.preseq1PrimerTargets)) {
                const preseq1PrimerTargetIds = _.map(body.preseq1PrimerTargets, 'targetId')
                await updatePreseq1PrimerTargets(id, preseq1PrimerTargetIds, tx)
            }

            return recordUpdated
        })

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
