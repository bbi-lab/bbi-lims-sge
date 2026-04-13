import { updateRecord } from '~/server/services/generic-services'
import _ from 'lodash'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { parsePutPostError } from '~/server/utils/restApi'
import { updateRelatedTargets } from '~/server/utils/sge'
import { homologyArmPrimerTargets, preseq1PrimerTargets, rnaPreseq1PrimerTargets, rnaPreseq2PrimerTargets } from '~/server/db/schema/sge/primer'
import { pcrExperimentTargets } from '~/server/db/schema/sge/pcr-experiment'
import { clonalHaTargets, sgRnaOligoTargets } from '~/server/db/schema/sge/oligos'
import { sgRnaPlasmidTargets } from '~/server/db/schema/sge/plasmid'

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
                const targets = await updateRelatedTargets(homologyArmPrimerTargets, 'homologyArmPrimerId', 'targetId', id, haPrimerTargetIds, tx)
                _.set(recordUpdated, 'targets', targets)
            } else if (_.camelCase(recordType) == 'pcrExperiments' && _.isArray(body.pcrExperimentTargets)) {
                const transfectTargetIds = _.map(body.pcrExperimentTargets, 'transfectTargetId')
                const targets = await updateRelatedTargets(pcrExperimentTargets, 'pcrExperimentId', 'transfectTargetId', id, transfectTargetIds, tx)
                _.set(recordUpdated, 'pcrExperimentTargets', targets)
            } else if (_.camelCase(recordType) == 'preseq1Primers' && _.isArray(body.preseq1PrimerTargets)) {
                const preseq1PrimerTargetIds = _.map(body.preseq1PrimerTargets, 'targetId')
                const targets = await updateRelatedTargets(preseq1PrimerTargets, 'preseq1PrimerId', 'targetId', id, preseq1PrimerTargetIds, tx)
                _.set(recordUpdated, 'preseq1PrimerTargets', targets)
            } else if (_.camelCase(recordType) == 'rnaPreseq1Primers' && _.isArray(body.rnaPreseq1PrimerTargets)) {
                const rnaPreseq1PrimerTargetIds = _.compact(_.map(body.rnaPreseq1PrimerTargets, 'targetId'))
                const targets = await updateRelatedTargets(rnaPreseq1PrimerTargets, 'rnaPreseq1PrimerId', 'targetId', id, rnaPreseq1PrimerTargetIds, tx)
                _.set(recordUpdated, 'rnaPreseq1PrimerTargets', targets)
            } else if (_.camelCase(recordType) == 'rnaPreseq2Primers' && _.isArray(body.rnaPreseq2PrimerTargets)) {
                const rnaPreseq2PrimerTargetIds = _.compact(_.map(body.rnaPreseq2PrimerTargets, 'targetId'))
                const targets = await updateRelatedTargets(rnaPreseq2PrimerTargets, 'rnaPreseq2PrimerId', 'targetId', id, rnaPreseq2PrimerTargetIds, tx)
                _.set(recordUpdated, 'rnaPreseq2PrimerTargets', targets)
            } else if (_.camelCase(recordType) == 'sgRnaOligos' && _.isArray(body.sgRnaOligoTargets)) {
                const sgRnaOligoTargetIds = _.compact(_.map(body.sgRnaOligoTargets, 'targetId'))
                const targets = await updateRelatedTargets(sgRnaOligoTargets, 'sgRnaOligoId', 'targetId', id, sgRnaOligoTargetIds, tx)
                _.set(recordUpdated, 'sgRnaOligoTargets', targets)
            } else if (_.camelCase(recordType) == 'sgRnaPlasmids' && _.isArray(body[0].sgRnaPlasmidTargets)) {
                const sgRnaPlasmidTargetIds = _.compact(_.map(body.sgRnaPlasmidTargets, 'targetId'))
                const targets = await updateRelatedTargets(sgRnaPlasmidTargets, 'sgRnaPlasmidId', 'targetId', id, sgRnaPlasmidTargetIds, tx)
                _.set(recordUpdated, '0.sgRnaPlasmidTargets', targets)
            } else if (_.camelCase(recordType) == 'clonalHas' && _.isArray(body.clonalHaTargets)) {
                const clonalHaTargetIds = _.compact(_.map(body.clonalHaTargets, 'targetId'))
                const targets = await updateRelatedTargets(clonalHaTargets, 'clonalHaId', 'targetId', id, clonalHaTargetIds, tx)
                _.set(recordUpdated, 'clonalHaTargets', targets)
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
