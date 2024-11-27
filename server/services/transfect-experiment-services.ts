import { eq, inArray } from 'drizzle-orm'
import { db } from '~/server/utils/db'
import _ from 'lodash'
import { transfectTargets } from '../db/schema/sge/transfect-experiment'

export async function updateTargets(experimentId: string, targetIds: string[]) {
    const existingTargets = await db.select({targetId: transfectTargets.targetId})
        .from(transfectTargets)
        .where(eq(transfectTargets.experimentId, experimentId))

    const existingTargetIds =  _.map(existingTargets, (x) => x.targetId)
    const targetsToRemove = _.difference(existingTargetIds, targetIds)
    const targetsToAdd = _.difference(targetIds, existingTargetIds)

    if (targetsToAdd?.length > 0)
        await db.insert(transfectTargets).values(_.map(targetsToAdd, (x) => { return {targetId: x, experimentId}}))
    if (targetsToRemove?.length > 0)
        await db.delete(transfectTargets).where(inArray(transfectTargets.targetId, targetsToRemove))
  }
