import _ from 'lodash'
import { schemas } from '~/server/db/schema/sge/zod'
import { parsePutPostError } from '../utils/restApi'
import { haCloningExperiments, haCloningExperimentTargets } from '../db/schema/sge/plasmid-experiment'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        if (body.length !== 1) {
            throw createError({
                statusCode: 400,
                statusMessage: `Invalid request body: ${JSON.stringify(body)}. Expected a single object.`
            })
        }
        const insertSchema = schemas.haCloningExperiments.insert
        const record = _.mapValues(body[0], (value) => _.isString(value) && _.isEmpty(value) ? null : value)
        const parsedRecord = insertSchema.parse(record)

        const result = await db.transaction(async (tx) => {
            const newHaCloningExperiments = await tx.insert(haCloningExperiments).values([parsedRecord]).returning({
                id: haCloningExperiments.id,
                name: haCloningExperiments.name,
                startedOn: haCloningExperiments.startedOn,
                endedOn: haCloningExperiments.endedOn,
            })

            let newHaCloningExperimentTargets: any[] = []
            if (newHaCloningExperiments.length !== 1) {
                throw createError({
                    statusCode: 500,
                    statusMessage: `Failed to create new HA cloning experiments.`
                })
            } else if (_.size(body[0].haCloningExperimentTargets) > 0) {
                const haCloningExperimentTargetsToInsert = _.map(_.filter(body[0].haCloningExperimentTargets, (x) => !_.isEmpty(x.targetId)), (x) => {
                    return {
                        haCloningExperimentId: newHaCloningExperiments[0].id,
                        targetId: x.targetId,
                    }
                })
                newHaCloningExperimentTargets = await tx.insert(haCloningExperimentTargets).values(haCloningExperimentTargetsToInsert).returning({
                    id: haCloningExperimentTargets.id,
                    haCloningExperimentId: haCloningExperimentTargets.haCloningExperimentId,
                    targetId: haCloningExperimentTargets.targetId,
                })
            }

            return {
                ...newHaCloningExperiments[0],
                haCloningExperimentTargets: newHaCloningExperimentTargets,
            }
        })
        return [result]
    } catch (e: any) {
        const { error, data } = parsePutPostError(e)

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
            data
        })
    }
})
