import { eq, inArray } from 'drizzle-orm'
import { db } from '~/server/utils/db'
import _ from 'lodash'
import { transfectTargets } from '../db/schema/sge/transfect-experiment'

export async function updateTargets(experimentId: string, transfectionTargets: {id: string, targetId: string, transfectionCount: number}[]) {
    const existingTransfectionTargets = await db.select({
        id: transfectTargets.id,
        targetId: transfectTargets.targetId,
        transfectionCount: transfectTargets.transfectionCount,
    }).from(transfectTargets)
        .where(eq(transfectTargets.experimentId, experimentId))

    // delete transfection targets that are not in the incoming list
    const missingTransfectionTargetIds = _.difference(_.map(existingTransfectionTargets, 'id'), _.map(transfectionTargets, 'id'))
    await db.delete(transfectTargets).where(inArray(transfectTargets.id, missingTransfectionTargetIds))

    // add or update transfection targets that are in the incoming list
    transfectionTargets.forEach(async (transfectionTarget) => {
        if (!transfectionTarget.id) {
            await db.insert(transfectTargets).values({...transfectionTarget, id: undefined, experimentId})
        } else {
            const existingTarget = _.find(existingTransfectionTargets, {id: transfectionTarget.id})
            if (!_.isEqual(existingTarget, transfectionTarget)) {
                await db.update(transfectTargets).set({
                    targetId: transfectionTarget.targetId,
                    transfectionCount: transfectionTarget.transfectionCount,
                }).where(eq(transfectTargets.id, transfectionTarget.id))
            }
        }
    })
  }
