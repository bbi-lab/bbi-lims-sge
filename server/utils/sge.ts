import _ from "lodash"
import { homologyArmPrimerTargets } from "../db/schema/sge/primer"
import { pcrExperimentTargets } from "../db/schema/sge/pcr-experiment"
import {eq, inArray} from "drizzle-orm"
import { deleteRecord } from "../services/generic-services"
import { wellContents, wells } from "../db/schema/sge/well"
import { plates } from "../db/schema/sge/plate"


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

export const updatePcrExperimentTransfectTargets = async (id: string, targetIds: string[]) => {
    const result = await db.transaction(async (tx) => {
        const existingTransfectTargets = await tx.select().from(pcrExperimentTargets).where(eq(pcrExperimentTargets.pcrExperimentId, id))

        // delete targets that are not in the incoming list
        const missingTransfectTargetIds = _.difference(_.map(existingTransfectTargets, 'transfectTargetId'), targetIds)
        await tx.delete(pcrExperimentTargets).where(inArray(pcrExperimentTargets.transfectTargetId, missingTransfectTargetIds))

        // insert targets that are in the incoming list and don't already exist
        const transfectTargetsToInsert = _.difference(targetIds, _.map(existingTransfectTargets, 'transfectTargetId'))
        if (!_.isEmpty(transfectTargetsToInsert)) {
            existingTransfectTargets.push(...await tx.insert(pcrExperimentTargets).values(transfectTargetsToInsert.map(targetId => ({ transfectTargetId: targetId, pcrExperimentId: id }))).returning())
        }
        return existingTransfectTargets
    })
    return result
}

export async function deleteEmptyPlate(plateId: string) {
    const nonEmptyWells = await db.select()
        .from(wells)
        .innerJoin(wellContents, eq(wells.id, wellContents.wellId))
        .where(eq(wells.plateId, plateId))

    // throw error if wells are not empty
    if (nonEmptyWells.length > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Plate wells must be empty before deleting'
        })
    }
    // delete wells then plate
    await db.delete(wells).where(eq(wells.plateId, plateId))
    const deletedRecord = await deleteRecord(plates, plateId)
    return deletedRecord
}
