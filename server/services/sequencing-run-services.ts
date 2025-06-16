import { plates } from "../db/schema/sge/plate"
import _ from "lodash"
import { eq, inArray } from "drizzle-orm"

export async function setRelatedPlates(plateIds: string[], sequencingRunId: string) {
    try {
        const existingPlates = await db.select().from(plates).where(eq(plates.sequencingRunId, sequencingRunId))
        const existingPlateIds = _.map(existingPlates, 'id')

        const platesToRemoveLink = _.difference(existingPlateIds, plateIds)
        const platesToAddLink = _.difference(plateIds, existingPlateIds)

        await db.update(plates)
            .set({ sequencingRunId: null })
            .where(inArray(plates.id, platesToRemoveLink))
        await db.update(plates)
            .set({ sequencingRunId })
            .where(inArray(plates.id, platesToAddLink))

    } catch (e: any) {
        const { error, data } = parsePutPostError(e, 'plates')

        throw createError({
            statusCode: 400,
            statusMessage: e.message,
            data
        })
    }
}
