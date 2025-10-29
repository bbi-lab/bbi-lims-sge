import _ from 'lodash'
import { updateRecord, selectRecord } from '~/server/services/generic-services'
import { schemas } from '~/server/db/schema/sge/zod'
import { ZodObject } from 'zod'
import { parsePutPostError } from '../../utils/restApi'
import { haCloningExperiments, haCloningExperimentTargets } from '../../db/schema/sge/plasmid-experiment'
import { eq, inArray } from 'drizzle-orm/sql'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as { id: string }

    try {
        const body = await readBody(event)

        const updateSchema = schemas.haCloningExperiments.update as ZodObject<any>
        const record = _.mapValues(body, (value) => _.isString(value) && _.isEmpty(value) ? null : value)
        const parsedRecord = updateSchema.parse(record)

        const result = await db.transaction(async (tx) => {
            const updatedHaCloningExperiment = await tx.update(haCloningExperiments).set(parsedRecord).where(eq(haCloningExperiments.id, id)).returning({
                id: haCloningExperiments.id,
                startedOn: haCloningExperiments.startedOn,
                endedOn: haCloningExperiments.endedOn,
            })

            let existingHaCloningExperimentTargets: any[] = []

            if (updatedHaCloningExperiment.length !== 1) {
                throw createError({
                    statusCode: 500,
                    statusMessage: `Failed to update HA cloning experiments.`
                })
            } else if (_.isArray(body.haCloningExperimentTargets)) {
                const haCloningExperimentTargetsInBody = _.map(_.filter(body.haCloningExperimentTargets, (x) => !_.isEmpty(x.targetId)), (x) => {
                    return {
                        haCloningExperimentId: updatedHaCloningExperiment[0].id,
                        targetId: x.targetId,
                    }
                })
                existingHaCloningExperimentTargets = await tx.select().from(haCloningExperimentTargets)
                    .where(eq(haCloningExperimentTargets.haCloningExperimentId, updatedHaCloningExperiment[0].id))

                // delete targets that are not in the incoming list
                const missingTransfectionTargetIds = _.difference(_.map(existingHaCloningExperimentTargets, 'targetId'), _.map(body.haCloningExperimentTargets, 'targetId'))
                await tx.delete(haCloningExperimentTargets).where(inArray(haCloningExperimentTargets.targetId, missingTransfectionTargetIds))

                // insert targets that are in the incoming list and don't already exist
                const haCloningExperimentTargetsToInsert = _.filter(haCloningExperimentTargetsInBody, (x) => !_.includes(_.map(existingHaCloningExperimentTargets, 'targetId'), x.targetId))
                if (!_.isEmpty(haCloningExperimentTargetsToInsert)) {
                    existingHaCloningExperimentTargets.push(...await tx.insert(haCloningExperimentTargets).values(haCloningExperimentTargetsToInsert).returning())
                }
            }

            return {
                ...updatedHaCloningExperiment[0],
                haCloningExperimentTargets: existingHaCloningExperimentTargets
            }
        })
        return result
    } catch (e: any) {
        const { error, data } = parsePutPostError(e, 'haCloningExperiments')

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
            data
        })
    }
})
