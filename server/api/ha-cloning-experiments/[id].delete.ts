import { deleteRecord } from '~/server/services/generic-services'
import _ from 'lodash'
import { parseDeleteError } from '~/server/utils/restApi'
import { haCloningExperiments, haCloningExperimentTargets } from '~/server/db/schema/sge/plasmid-experiment'
import { eq } from 'drizzle-orm/sql'
import { tsv } from 'd3'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as { id: string }

    try {
        const result = await db.transaction(async (tx) => {
            await tx.delete(haCloningExperimentTargets).where(eq(haCloningExperimentTargets.haCloningExperimentId, id))
            const deletedRecord = await tx.delete(haCloningExperiments).where(eq(haCloningExperiments.id, id)).returning()

            if (deletedRecord.length !== 1) {
                throw createError({
                    statusCode: 500,
                    statusMessage: `Failed to delete HA cloning experiment.`
                })
            }
            return deletedRecord[0]
        })
        return result

    } catch (e: any) {
        await parseDeleteError(e, id)

        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
