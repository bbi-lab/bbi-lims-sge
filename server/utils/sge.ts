import _ from "lodash"
import { pcrExperiments } from "../db/schema/sge/pcr-experiment"
import {and, eq, inArray} from "drizzle-orm"
import { deleteRecord } from "../services/generic-services"
import { wellContents, wellContentSources, wells } from "../db/schema/sge/well"
import { plates, type PlateType } from "../db/schema/sge/plate"
import type { PgTable, PgTransaction } from "drizzle-orm/pg-core"
import { sgRnaCloningExperiments } from "../db/schema/sge/plasmid-experiment"
import { targets } from "../db/schema/sge/target"


export const updateRelatedTargets = async (
    table: PgTable<any>,
    parentIdKey: string,
    targetIdKey: string,
    id: string,
    targetIds: string[],
    tx?: PgTransaction<any, any, any>
) => {
    const parentIdCol = (table as any)[parentIdKey]
    const targetIdCol = (table as any)[targetIdKey]

    const updateFunction = async (tx: PgTransaction<any, any, any>) => {
        const existing = await tx.select().from(table).where(eq(parentIdCol, id))

        const missingIds = _.difference(_.map(existing, targetIdKey), targetIds)
        await tx.delete(table).where(and(eq(parentIdCol, id), inArray(targetIdCol, missingIds)))

        const idsToInsert = _.difference(targetIds, _.map(existing, targetIdKey))
        if (!_.isEmpty(idsToInsert)) {
            existing.push(...await tx.insert(table).values(
                idsToInsert.map(tId => ({ [targetIdKey]: tId, [parentIdKey]: id }))
            ).returning())
        }
        return existing
    }

    return tx ? await updateFunction(tx) : await db.transaction(async (tx) => await updateFunction(tx))
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
