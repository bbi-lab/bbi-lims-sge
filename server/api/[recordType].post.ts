import _ from 'lodash'
import { insertRecords } from '~/server/services/generic-services'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { useDrizzle } from '../utils/db'
import { parsePutPostError } from '../utils/restApi'
import { updateHomologyArmPrimerTargets, updatePcrExperimentTransfectTargets, updatePreseq1PrimerTargets } from '../utils/sge'
import { insertPlate } from '../services/plate-services'

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
            const insertedRecords = await insertRecords(_.get(db, ['query', _.camelCase(recordType), 'table']), records, tx)

            // handle single HA primer, PCR experiment, and Preseq 1 primer inserts that include array of targets
            if (body.length == 1 && insertedRecords?.length == 1) {
                if (_.camelCase(recordType) == 'homologyArmPrimers' && _.isArray(body[0].targets)) {
                    const targets = await updateHomologyArmPrimerTargets(insertedRecords[0].id, _.map(body[0].targets, 'targetId'), tx)
                    _.set(insertedRecords, '0.targets', targets)
                } else if (_.camelCase(recordType) == 'pcrExperiments') {
                    // add corresponding PCR plate with same name as experiment
                    const newPlate = {
                        name: insertedRecords[0].name,
                        sizeX: 12,
                        sizeY: 8,
                        plateType: insertedRecords[0].pcrType,
                        pcrExperimentId: insertedRecords[0].id,
                    }
                    await insertPlate(newPlate, tx)

                    if (_.isArray(body[0].pcrExperimentTargets)) {
                        const transfectTargetIds = _.map(body[0].pcrExperimentTargets, 'transfectTargetId')
                        await updatePcrExperimentTransfectTargets(insertedRecords[0].id, transfectTargetIds, tx)
                    }
                } else if (_.camelCase(recordType) == 'preseq1Primers' && _.isArray(body[0].preseq1PrimerTargets)) {
                    const preseq1PrimerTargetIds = _.map(body[0].preseq1PrimerTargets, 'targetId')
                    await updatePreseq1PrimerTargets(insertedRecords[0].id, preseq1PrimerTargetIds, tx)
                }
            }
            return insertedRecords
        })

        return newRecords
    } catch (e: any) {
        const { error, data } = parsePutPostError(e, recordType)

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
            data
        })
    }
})
