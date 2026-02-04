import _ from 'lodash'
import { insertRecords } from '~/server/services/generic-services'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { useDrizzle } from '../utils/db'
import { parsePutPostError } from '../utils/restApi'
import { updateHomologyArmPrimerTargets, updatePcrExperimentTransfectTargets, updatePreseq1PrimerTargets } from '../utils/sge'

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

        const newRecords = await insertRecords(_.get(db, ['query', _.camelCase(recordType), 'table']), records)

        // handle single HA primer and PCR experiment inserts that include array of targets
        if (body.length == 1 && newRecords?.length == 1) {
            if (_.camelCase(recordType) == 'homologyArmPrimers' && _.isArray(body[0].targets)) {
            const targets = await updateHomologyArmPrimerTargets(newRecords[0].id, _.map(body[0].targets, 'targetId'))
                _.set(newRecords, '0.targets', targets)
            } else if (_.camelCase(recordType) == 'pcrExperiments' && _.isArray(body[0].pcrExperimentTargets)) {
                const transfectTargetIds = _.map(body[0].pcrExperimentTargets, 'transfectTargetId')
                await updatePcrExperimentTransfectTargets(newRecords[0].id, transfectTargetIds)
            } else if (_.camelCase(recordType) == 'preseq1Primers' && _.isArray(body[0].preseq1PrimerTargets)) {
                const preseq1PrimerTargetIds = _.map(body[0].preseq1PrimerTargets, 'targetId')
                await updatePreseq1PrimerTargets(newRecords[0].id, preseq1PrimerTargetIds)
            }
        }

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
