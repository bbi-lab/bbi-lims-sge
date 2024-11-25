import { eq, inArray } from 'drizzle-orm'
import { db } from '~/server/utils/db'
import _ from 'lodash'
import { transfectionExperimentsTargets } from '../db/schema/sge/transfection-experiment'

export async function updateTargets(transfectionExperimentId: string, targetIds: string[]) {
    const existingTargets = await db.select({targetId: transfectionExperimentsTargets.targetId})
        .from(transfectionExperimentsTargets)
        .where(eq(transfectionExperimentsTargets.transfectionExperimentId, transfectionExperimentId))

    const existingTargetIds =  _.map(existingTargets, (x) => x.targetId)
    const targetsToRemove = _.difference(existingTargetIds, targetIds)
    const targetsToAdd = _.difference(targetIds, existingTargetIds)

    if (targetsToAdd?.length > 0)
        await db.insert(transfectionExperimentsTargets).values(_.map(targetsToAdd, (x) => { return {targetId: x, transfectionExperimentId}}))
    if (targetsToRemove?.length > 0)
        await db.delete(transfectionExperimentsTargets).where(inArray(transfectionExperimentsTargets.targetId, targetsToRemove))
  }
