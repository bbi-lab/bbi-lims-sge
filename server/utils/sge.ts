import _ from "lodash"
import { homologyArmPrimerTargets, preseq1PrimerTargets } from "../db/schema/sge/primer"
import { pcrExperimentTargets } from "../db/schema/sge/pcr-experiment"
import {eq, inArray} from "drizzle-orm"
import { deleteRecord } from "../services/generic-services"
import { wellContents, wellContentSources, wells } from "../db/schema/sge/well"
import { plates } from "../db/schema/sge/plate"
import type { PgTransaction } from "drizzle-orm/pg-core"


export const updateHomologyArmPrimerTargets = async (id: string, targetIds: string[], tx?: PgTransaction<any, any, any>) => {
    const updateFunction = async (tx: PgTransaction<any, any, any>) => {
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
    }

    const result = tx ? await updateFunction(tx) : await db.transaction(async (tx) => { return await updateFunction(tx) })
    return result
}

export const updatePcrExperimentTransfectTargets = async (id: string, targetIds: string[], tx?: PgTransaction<any, any, any>) => {
    const updateFunction = async (tx: PgTransaction<any, any, any>) => {
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
    }

    const result = tx ? await updateFunction(tx) : await db.transaction(async (tx) => { return await updateFunction(tx) })
    return result
}

export const updatePreseq1PrimerTargets = async (id: string, targetIds: string[], tx?: PgTransaction<any, any, any>) => {
    const updateFunction = async (tx: PgTransaction<any, any, any>) => {
        const existingPreseq1PrimerTargets = await tx.select().from(preseq1PrimerTargets).where(eq(preseq1PrimerTargets.preseq1PrimerId, id))

        // delete targets that are not in the incoming list
        const missingPreseq1PrimerTargetIds = _.difference(_.map(existingPreseq1PrimerTargets, 'targetId'), targetIds)
        await tx.delete(preseq1PrimerTargets).where(inArray(preseq1PrimerTargets.targetId, missingPreseq1PrimerTargetIds))
        // insert targets that are in the incoming list and don't already exist
        const preseq1PrimerTargetsToInsert = _.difference(targetIds, _.map(existingPreseq1PrimerTargets, 'targetId'))
        if (!_.isEmpty(preseq1PrimerTargetsToInsert)) {
            existingPreseq1PrimerTargets.push(...await tx.insert(preseq1PrimerTargets).values(preseq1PrimerTargetsToInsert.map(targetId => ({ targetId, preseq1PrimerId: id }))).returning())
        }
        return existingPreseq1PrimerTargets
    }
    const result = tx ? await updateFunction(tx) : await db.transaction(async (tx) => { return await updateFunction(tx) })
    return result
}

export async function deleteEmptyPlate(plateId: string, tx?: PgTransaction<any, any, any>) {
    const nonEmptyWells = await (tx ?? db).select()
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
    // delete associated wellContentSources and wells then plate
    const emptyWells = await (tx ?? db).select().from(wells).where(eq(wells.plateId, plateId))
    await (tx ?? db).delete(wellContentSources).where(inArray(wellContentSources.sourceWellId, _.map(emptyWells, 'id')))
    await (tx ?? db).delete(wells).where(eq(wells.plateId, plateId))
    const deletedRecord = await deleteRecord(plates, plateId, tx)
    return deletedRecord
}
