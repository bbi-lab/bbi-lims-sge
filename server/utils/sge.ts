import _ from "lodash"
import { homologyArmPrimerTargets } from "../db/schema/sge/primer"
import {eq, inArray} from "drizzle-orm"


export const updateHomologyArmPrimerTargets = async (id: string, targetIds: string[]) => {

    const result = await db.transaction(async (tx) => {
        const existingTargets = await tx.select().from(homologyArmPrimerTargets).where(eq(homologyArmPrimerTargets.homologyArmPrimerId, id))

        // delete targets that are not in the incoming list
        const missingTargetIds = _.difference(_.map(existingTargets, 'targetId'), targetIds)
        await tx.delete(homologyArmPrimerTargets).where(inArray(homologyArmPrimerTargets.targetId, missingTargetIds))

        // insert targets that are in the incoming list and don't already exist
        const targetsToInsert = _.difference(targetIds, _.map(existingTargets, 'targetId'))
        if (!_.isEmpty(targetsToInsert)) {
            existingTargets.push(...await tx.insert(homologyArmPrimerTargets).values(targetsToInsert.map(targetId => ({ targetId, homologyArmPrimerId: id }))).returning())
        }
        return existingTargets
    })
    return result
}
