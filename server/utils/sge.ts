import _ from "lodash"
import { homologyArmPrimerTargets, preseq1PrimerTargets, rnaPreseq1PrimerTargets, rnaPreseq2PrimerTargets } from "../db/schema/sge/primer"
import { pcrExperiments, pcrExperimentTargets } from "../db/schema/sge/pcr-experiment"
import {and, eq, inArray} from "drizzle-orm"
import { deleteRecord } from "../services/generic-services"
import { wellContents, wellContentSources, wells } from "../db/schema/sge/well"
import { plates, PlateType } from "../db/schema/sge/plate"
import type { PgTransaction } from "drizzle-orm/pg-core"
import { sgRnaCloningExperiments } from "../db/schema/sge/plasmid-experiment"
import { targets } from "../db/schema/sge/target"
import { sgRnaOligoTargets } from "../db/schema/sge/oligos"


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

export const updateRnaPreseq1PrimerTargets = async (id: string, targetIds: string[], tx?: PgTransaction<any, any, any>) => {
    const updateFunction = async (tx: PgTransaction<any, any, any>) => {
        const existingRnaPreseq1PrimerTargets = await tx.select().from(rnaPreseq1PrimerTargets).where(eq(rnaPreseq1PrimerTargets.rnaPreseq1PrimerId, id))

        // delete targets that are not in the incoming list
        const missingRnaPreseq1PrimerTargetIds = _.difference(_.map(existingRnaPreseq1PrimerTargets, 'targetId'), targetIds)
        await tx.delete(rnaPreseq1PrimerTargets).where(inArray(rnaPreseq1PrimerTargets.targetId, missingRnaPreseq1PrimerTargetIds))
        // insert targets that are in the incoming list and don't already exist
        const rnaPreseq1PrimerTargetsToInsert = _.difference(targetIds, _.map(existingRnaPreseq1PrimerTargets, 'targetId'))
        if (!_.isEmpty(rnaPreseq1PrimerTargetsToInsert)) {
            existingRnaPreseq1PrimerTargets.push(...await tx.insert(rnaPreseq1PrimerTargets).values(rnaPreseq1PrimerTargetsToInsert.map(targetId => ({ targetId, rnaPreseq1PrimerId: id }))).returning())
        }
        return existingRnaPreseq1PrimerTargets
    }
    const result = tx ? await updateFunction(tx) : await db.transaction(async (tx) => { return await updateFunction(tx) })
    return result
}

export const updateRnaPreseq2PrimerTargets = async (id: string, targetIds: string[], tx?: PgTransaction<any, any, any>) => {
    const updateFunction = async (tx: PgTransaction<any, any, any>) => {
        const existingRnaPreseq2PrimerTargets = await tx.select().from(rnaPreseq2PrimerTargets).where(eq(rnaPreseq2PrimerTargets.rnaPreseq2PrimerId, id))

        // delete targets that are not in the incoming list
        const missingRnaPreseq2PrimerTargetIds = _.difference(_.map(existingRnaPreseq2PrimerTargets, 'targetId'), targetIds)
        await tx.delete(rnaPreseq2PrimerTargets).where(inArray(rnaPreseq2PrimerTargets.targetId, missingRnaPreseq2PrimerTargetIds))
        // insert targets that are in the incoming list and don't already exist
        const rnaPreseq2PrimerTargetsToInsert = _.difference(targetIds, _.map(existingRnaPreseq2PrimerTargets, 'targetId'))
        if (!_.isEmpty(rnaPreseq2PrimerTargetsToInsert)) {
            existingRnaPreseq2PrimerTargets.push(...await tx.insert(rnaPreseq2PrimerTargets).values(rnaPreseq2PrimerTargetsToInsert.map(targetId => ({ targetId, rnaPreseq2PrimerId: id }))).returning())
        }
        return existingRnaPreseq2PrimerTargets
    }
    const result = tx ? await updateFunction(tx) : await db.transaction(async (tx) => { return await updateFunction(tx) })
    return result
}

export const updateSgRnaOligoTargets = async (id: string, targetIds: string[], tx?: PgTransaction<any, any, any>) => {
    const updateFunction = async (tx: PgTransaction<any, any, any>) => {
        const existingSgRnaOligoTargets = await tx.select().from(sgRnaOligoTargets).where(eq(sgRnaOligoTargets.sgRnaOligoId, id))

        // delete targets that are not in the incoming list
        const missingSgRnaOligoTargetIds = _.difference(_.map(existingSgRnaOligoTargets, 'targetId'), targetIds)
        await tx.delete(sgRnaOligoTargets).where(inArray(sgRnaOligoTargets.targetId, missingSgRnaOligoTargetIds))
        // insert targets that are in the incoming list and don't already exist
        const sgRnaOligoTargetsToInsert = _.difference(targetIds, _.map(existingSgRnaOligoTargets, 'targetId'))
        if (!_.isEmpty(sgRnaOligoTargetsToInsert)) {
            existingSgRnaOligoTargets.push(...await tx.insert(sgRnaOligoTargets).values(sgRnaOligoTargetsToInsert.map(targetId => ({ targetId, sgRnaOligoId: id }))).returning())
        }
        return existingSgRnaOligoTargets
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

    // check if plate is associated with any PCR or sgRNA cloning experiments and throw error if it is
    const associatedPcrExperiments = await (tx ?? db).select().from(pcrExperiments).where(eq(pcrExperiments.plateId, plateId))
    if (associatedPcrExperiments.length > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'This plate is associated with a PCR experiment and will be deleted when the experiment is deleted.'
        })
    }
    const associatedsgRnaCloningExperiments = await (tx ?? db).select().from(sgRnaCloningExperiments).where(eq(sgRnaCloningExperiments.plateId, plateId))
    if (associatedsgRnaCloningExperiments.length > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'This plate is associated with an sgRNA cloning experiment and will be deleted when the experiment is deleted.'
        })
    }

    // delete associated wellContentSources and wells then plate
    const emptyWells = await (tx ?? db).select().from(wells).where(eq(wells.plateId, plateId))
    await (tx ?? db).delete(wellContentSources).where(inArray(wellContentSources.sourceWellId, _.map(emptyWells, 'id')))
    await (tx ?? db).delete(wells).where(eq(wells.plateId, plateId))
    const deletedRecord = await deleteRecord(plates, plateId, tx)
    return deletedRecord
}

export async function plateStorageBoxNamesToIdsMap(plateStorageBoxNames: string[], plateType: PlateType, tx?: PgTransaction<any, any, any>) {
    const plateRecords = await (tx ?? db).select().from(plates).where(and(inArray(plates.name, plateStorageBoxNames), eq(plates.plateType, plateType)))
    const plateNameToIdMap = _.keyBy(plateRecords, 'name')
    return _.mapValues(plateNameToIdMap, 'id')
}

export async function targetNamesToIdsMap(targetNames: string[], tx?: PgTransaction<any, any, any>) {
    const targetRecords = await (tx ?? db).select().from(targets).where(inArray(targets.name, targetNames))
    const targetNameToIdMap = _.keyBy(targetRecords, 'name')
    return _.mapValues(targetNameToIdMap, 'id')
}

export const getWellIdFromPlateNameAndWellLocation = async (plateName: string, wellLocation: string, tx?: PgTransaction<any, any, any>) => {
    const plateRecord = await (tx ?? db).select().from(plates).where(eq(plates.name, plateName)).limit(1)

    if (plateRecord.length !== 1) {
        throw new Error(`Could not find plate with name ${plateName}`)
    }

    // convert well location from A1 format to row/column
    const match = wellLocation.match(/^([A-Za-z]+)(\d+)$/)
    if (!match) {
        throw new Error(`Invalid well location format: ${wellLocation}`)
    }
    const yCoord = match[1].toLowerCase().charCodeAt(0) - 96
    const xCoord = parseInt(match[2])

    const wellRecord = await (tx ?? db).select().from(wells).where(and(eq(wells.plateId, plateRecord[0].id), eq(wells.x, xCoord), eq(wells.y, yCoord))).limit(1)

    if (wellRecord.length !== 1) {
        throw new Error(`Could not find well with location ${wellLocation} in plate ${plateName}`)
    }

    return wellRecord[0].id
}

export const wellContentsCount = async (wellId: string, tx?: PgTransaction<any, any, any>) => {
    const wellContent = await (tx ?? db).select().from(wellContents).where(eq(wellContents.wellId, wellId))
    return wellContent.length
}
