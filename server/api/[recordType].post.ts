import _ from 'lodash'
import { insertRecords } from '~/server/services/generic-services'
import { schemas } from '~/server/db/schema/sge/zod'
import type { ZodObject } from 'zod'
import { useDrizzle } from '../utils/db'
import { parsePutPostError } from '../utils/restApi'
import { updateRelatedTargets, updateRelatedLots } from '../utils/sge'
import { insertPlate } from '../services/plate-services'
import { homologyArmPrimerTargets, preseq1PrimerTargets, rnaPreseq1PrimerTargets, rnaPreseq2PrimerTargets } from '../db/schema/sge/primer'
import { clonalHaTargets, sgRnaOligoTargets, sgeOligoLots } from '../db/schema/sge/oligos'
import { pcr1ExperimentMasterMixVolumes, pcr2ExperimentMasterMixVolumes, pcrExperimentTargets } from '../db/schema/sge/pcr-experiment'
import { sgRnaPlasmidTargets } from '../db/schema/sge/plasmid'

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
        const insertSchema = _.get(schemas, [_.camelCase(recordType), 'insert']) as ZodObject<any>
        const records = _.map(body, (x) => {
            const record = _.mapValues(x, (value) => _.isString(value) && _.isEmpty(value) ? null : value)
            return insertSchema.parse(record)
        })

        const newRecords = await db.transaction(async (tx) => {
            if (body.length == 1) {
                // if plateId not included in PCR experiment or sgRNA cloning experiment, add plate with same name as experiment and set plateId to new plate
                if (!_.get(records, '0.plateId') &&['pcrExperiments', 'sgRnaCloningExperiments'].includes(_.camelCase(recordType)) && records[0].pcrType != 'rna-rt') {
                    // add corresponding plate with same name as experiment
                    const plateType = _.camelCase(recordType) == 'pcrExperiments' ?  records[0].pcrType : 'sg-rna-oligo'
                    const plate = {
                        name: body[0].name,
                        sizeX: 12,
                        sizeY: 8,
                        plateType: plateType,
                    }
                    const newPlate = await insertPlate(plate, tx)

                    // set plateId of experiment to new plate
                    if (newPlate) _.set(records, '0.plateId', newPlate.id)
                }
            }
            const insertedRecords = await insertRecords(_.get(db, ['query', _.camelCase(recordType), 'table']), records, tx)

            // handle single HA primer, PCR experiment, and DNA and RNA Preseq primer inserts that include array of targets
            if (body.length == 1 && insertedRecords?.length == 1) {
                if (_.camelCase(recordType) == 'homologyArmPrimers' && _.isArray(body[0].targets)) {
                    const targetIds = _.compact(_.map(body[0].targets, 'targetId'))
                    const targets = await updateRelatedTargets(homologyArmPrimerTargets, 'homologyArmPrimerId', 'targetId', insertedRecords[0].id, targetIds, tx)
                    _.set(insertedRecords, '0.targets', targets)
                } else if (_.camelCase(recordType) == 'pcrExperiments' && _.isArray(body[0].pcrExperimentTargets)) {
                    const transfectTargetIds = _.compact(_.map(body[0].pcrExperimentTargets, 'transfectTargetId'))
                    // if included in request, transfectTargetIds should not be empty, so throw error if no transfect target ids provided
                    if (_.isEmpty(transfectTargetIds)) {
                        throw createError({
                            statusCode: 400,
                            statusMessage: `Target(s) required`,
                        })
                    }
                    const targets = await updateRelatedTargets(pcrExperimentTargets, 'pcrExperimentId', 'transfectTargetId', insertedRecords[0].id, transfectTargetIds, tx)
                    _.set(insertedRecords, '0.pcrExperimentTargets', targets)
                } else if (_.camelCase(recordType) == 'preseq1Primers' && _.isArray(body[0].preseq1PrimerTargets)) {
                    const preseq1PrimerTargetIds = _.compact(_.map(body[0].preseq1PrimerTargets, 'targetId'))
                    const targets = await updateRelatedTargets(preseq1PrimerTargets, 'preseq1PrimerId', 'targetId', insertedRecords[0].id, preseq1PrimerTargetIds, tx)
                    _.set(insertedRecords, '0.preseq1PrimerTargets', targets)
                } else if (_.camelCase(recordType) == 'rnaPreseq1Primers' && _.isArray(body[0].rnaPreseq1PrimerTargets)) {
                    const rnaPreseq1PrimerTargetIds = _.compact(_.map(body[0].rnaPreseq1PrimerTargets, 'targetId'))
                    const targets = await updateRelatedTargets(rnaPreseq1PrimerTargets, 'rnaPreseq1PrimerId', 'targetId', insertedRecords[0].id, rnaPreseq1PrimerTargetIds, tx)
                    _.set(insertedRecords, '0.rnaPreseq1PrimerTargets', targets)
                } else if (_.camelCase(recordType) == 'rnaPreseq2Primers' && _.isArray(body[0].rnaPreseq2PrimerTargets)) {
                    const rnaPreseq2PrimerTargetIds = _.compact(_.map(body[0].rnaPreseq2PrimerTargets, 'targetId'))
                    const targets = await updateRelatedTargets(rnaPreseq2PrimerTargets, 'rnaPreseq2PrimerId', 'targetId', insertedRecords[0].id, rnaPreseq2PrimerTargetIds, tx)
                    _.set(insertedRecords, '0.rnaPreseq2PrimerTargets', targets)
                } else if (_.camelCase(recordType) == 'sgRnaOligos' && _.isArray(body[0].sgRnaOligoTargets)) {
                    const sgRnaOligoTargetIds = _.compact(_.map(body[0].sgRnaOligoTargets, 'targetId'))
                    const targets = await updateRelatedTargets(sgRnaOligoTargets, 'sgRnaOligoId', 'targetId', insertedRecords[0].id, sgRnaOligoTargetIds, tx)
                    _.set(insertedRecords, '0.sgRnaOligoTargets', targets)
                } else if (_.camelCase(recordType) == 'sgRnaPlasmids' && _.isArray(body[0].sgRnaPlasmidTargets)) {
                    const sgRnaPlasmidTargetIds = _.compact(_.map(body[0].sgRnaPlasmidTargets, 'targetId'))
                    const targets = await updateRelatedTargets(sgRnaPlasmidTargets, 'sgRnaPlasmidId', 'targetId', insertedRecords[0].id, sgRnaPlasmidTargetIds, tx)
                    _.set(insertedRecords, '0.sgRnaPlasmidTargets', targets)
                } else if (_.camelCase(recordType) == 'clonalHas' && _.isArray(body[0].clonalHaTargets)) {
                    const clonalHaTargetIds = _.compact(_.map(body[0].clonalHaTargets, 'targetId'))
                    const targets = await updateRelatedTargets(clonalHaTargets, 'clonalHaId', 'targetId', insertedRecords[0].id, clonalHaTargetIds, tx)
                    _.set(insertedRecords, '0.clonalHaTargets', targets)
                } else if (_.camelCase(recordType) == 'sgeOligos' && _.isArray(body[0].sgeOligoLots)) {
                    const lotIds = _.compact(_.map(body[0].sgeOligoLots, 'lotId'))
                    const updatedLots = await updateRelatedLots(sgeOligoLots, 'sgeOligoId', 'lotId', insertedRecords[0].id, lotIds, tx)
                    _.set(insertedRecords, '0.sgeOligoLots', updatedLots)
                }
            }

            // for each pcr1 experiment inserted, also insert default master mix values with reference to new pcr experiment id
            if (_.camelCase(recordType) == 'pcrExperiments' && insertedRecords.length > 0) {
                const pcr1Experiments = _.filter(insertedRecords, (record) => ['rna-preseq-1', 'dna-preseq-1'].includes(record.pcrType))
                for (const experiment of pcr1Experiments) {
                    const masterMixValues = {
                        pcrExperimentId: experiment.id,
                    }
                    await tx.insert(pcr1ExperimentMasterMixVolumes).values(masterMixValues)
                }
                const pcr2Experiments = _.filter(insertedRecords, (record) => ['rna-preseq-2', 'dna-preseq-2'].includes(record.pcrType))
                for (const experiment of pcr2Experiments) {
                    const masterMixValues = {
                        pcrExperimentId: experiment.id,
                    }
                    await tx.insert(pcr2ExperimentMasterMixVolumes).values(masterMixValues)
                }
            }

            return insertedRecords
        })

        return newRecords
    } catch (e: any) {
        const { error, data } = parsePutPostError(e)

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
            data
        })
    }
})
