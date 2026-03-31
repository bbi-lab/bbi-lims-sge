import _ from 'lodash'
import { insertRecords } from '~/server/services/generic-services'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { useDrizzle } from '../utils/db'
import { parsePutPostError } from '../utils/restApi'
import { updateHomologyArmPrimerTargets, updatePcrExperimentTransfectTargets, updatePreseq1PrimerTargets, updateRnaPreseq1PrimerTargets, updateRnaPreseq2PrimerTargets } from '../utils/sge'
import { insertPlate } from '../services/plate-services'
import { assert } from 'node:console'

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

        const newRecords = await db.transaction(async (tx) => {
            if (body.length == 1) {
                if (['pcrExperiments', 'sgRnaCloningExperiments'].includes(_.camelCase(recordType)) && records[0].pcrType != 'rna-rt') {
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
                    const targets = await updateHomologyArmPrimerTargets(insertedRecords[0].id, targetIds, tx)
                    _.set(insertedRecords, '0.targets', targets)
                } else if (_.camelCase(recordType) == 'pcrExperiments' && _.isArray(body[0].pcrExperimentTargets)) {
                    const transfectTargetIds = _.compact(_.map(body[0].pcrExperimentTargets, 'transfectTargetId'))
                    await updatePcrExperimentTransfectTargets(insertedRecords[0].id, transfectTargetIds, tx)
                } else if (_.camelCase(recordType) == 'preseq1Primers' && _.isArray(body[0].preseq1PrimerTargets)) {
                    const preseq1PrimerTargetIds = _.compact(_.map(body[0].preseq1PrimerTargets, 'targetId'))
                    await updatePreseq1PrimerTargets(insertedRecords[0].id, preseq1PrimerTargetIds, tx)
                } else if (_.camelCase(recordType) == 'rnaPreseq1Primers' && _.isArray(body[0].rnaPreseq1PrimerTargets)) {
                    const rnaPreseq1PrimerTargetIds = _.compact(_.map(body[0].rnaPreseq1PrimerTargets, 'targetId'))
                    await updateRnaPreseq1PrimerTargets(insertedRecords[0].id, rnaPreseq1PrimerTargetIds, tx)
                } else if (_.camelCase(recordType) == 'rnaPreseq2Primers' && _.isArray(body[0].rnaPreseq2PrimerTargets)) {
                    const rnaPreseq2PrimerTargetIds = _.compact(_.map(body[0].rnaPreseq2PrimerTargets, 'targetId'))
                    await updateRnaPreseq2PrimerTargets(insertedRecords[0].id, rnaPreseq2PrimerTargetIds, tx)
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
