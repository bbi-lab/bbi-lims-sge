import { updateRecord } from '~/server/services/generic-services'
import _ from 'lodash'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { parsePutPostError } from '~/server/utils/restApi'
import { updateHomologyArmPrimerTargets, updatePcrExperimentTransfectTargets, updatePreseq1PrimerTargets, updateRnaPreseq1PrimerTargets, updateRnaPreseq2PrimerTargets, updateSgRnaOligoTargets } from '~/server/utils/sge'

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
            } else if (_.camelCase(recordType) == 'rnaPreseq1Primers' && _.isArray(body.rnaPreseq1PrimerTargets)) {
                const rnaPreseq1PrimerTargetIds = _.compact(_.map(body.rnaPreseq1PrimerTargets, 'targetId'))
                await updateRnaPreseq1PrimerTargets(id, rnaPreseq1PrimerTargetIds, tx)
            } else if (_.camelCase(recordType) == 'rnaPreseq2Primers' && _.isArray(body.rnaPreseq2PrimerTargets)) {
                const rnaPreseq2PrimerTargetIds = _.compact(_.map(body.rnaPreseq2PrimerTargets, 'targetId'))
                await updateRnaPreseq2PrimerTargets(id, rnaPreseq2PrimerTargetIds, tx)
            } else if (_.camelCase(recordType) == 'sgRnaOligos' && _.isArray(body.sgRnaOligoTargets)) {
                const sgRnaOligoTargetIds = _.compact(_.map(body.sgRnaOligoTargets, 'targetId'))
                await updateSgRnaOligoTargets(id, sgRnaOligoTargetIds, tx)
            }

            return recordUpdated
        })

        return updatedRecord
    } catch (e: any) {
        const { error, data } = parsePutPostError(e)

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
            data
        })
    }
})
