import _ from 'lodash'
import { v4 as uuid } from 'uuid'
import { homologyArmPrimers, homologyArmPrimerTargets } from '~/server/db/schema/sge/primer'
import { schemas } from '~/server/db/schema/sge/zod'
import { insertRecords } from '~/server/services/generic-services'
import {
    getWellIdFromPlateNameAndWellLocation,
    plateStorageBoxNamesToIdsMap,
    targetNamesToIdsMap,
    updateRelatedTargets,
    wellContentsCount,
} from '~/server/utils/sge'
import { wellContents } from '~/server/db/schema/sge/well'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)

        if (!Array.isArray(body) || body.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Request body must be a non-empty array of records',
            })
        }

        const db = useDrizzle()

        // Extract and validate all unique target names.
        // "targetNameS" (capital S) is the camelCase of the "Target Name(s)" column header.
        const targetNames = _.uniq(
            _.flatMap(body, (row) => {
                const targetNameString = row.targetNameS || ''
                return _.map(_.split(targetNameString, ','), (name) => _.trim(name)).filter(Boolean)
            })
        )

        if (targetNames.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No target names found in the uploaded data (expected column: Target Name(s))',
            })
        }

        const targetIdsByName = await targetNamesToIdsMap(targetNames)

        const missingTargets = _.difference(targetNames, _.keys(targetIdsByName))
        if (missingTargets.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `Target names not found in database: ${missingTargets.join(', ')}`,
            })
        }

        // Extract and validate plate/storage box names
        const plateNames = _.uniq(
            _.map(body, (row) => _.trim(row.plateStorageBoxName || '')).filter(Boolean)
        )

        const plateIdsByName = plateNames.length > 0
            ? await plateStorageBoxNamesToIdsMap(plateNames, 'ha-primer-storage')
            : {}

        const missingPlates = _.difference(plateNames, _.keys(plateIdsByName))
        if (missingPlates.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `HA primer storage plates not found in database: ${missingPlates.join(', ')}`,
            })
        }

        // Map rows to primer records
        const primerRecords = _.map(body, (row) => {
            const targetNameString = row.targetNameS || ''
            const primerTargetNames = _.map(
                _.split(targetNameString, ','),
                (name) => _.trim(name)
            ).filter(Boolean)

            return {
                id: uuid(),
                name: _.trim(row.primerName || row.name || ''),
                sequence: _.trim(row.sequence || ''),
                sequenceType: _.toLower(_.trim(row.forwardReverse || '')),
                cloningStrategy: _.trim(row.cloningStrategy || '') || null,
                orderedOn: row.orderedOn ? new Date(row.orderedOn) : null,
                notes: _.trim(row.notes || ''),
                // kept for relationship/well assignment; omitted from DB insert
                targetNames: primerTargetNames,
                plateStorageBoxName: _.trim(row.plateStorageBoxName || ''),
                wellTubeCoordinates: _.trim(row.wellTubeCoordinates || ''),
            }
        })

        // Validate unique names
        const duplicateNames = _.keys(_.pickBy(_.countBy(primerRecords, 'name'), (count) => count > 1))
        if (duplicateNames.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `Duplicate primer names found: ${duplicateNames.join(', ')}`,
            })
        }

        const missingNames = _.filter(primerRecords, (p) => !p.name).length
        if (missingNames > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `${missingNames} record(s) are missing primer names`,
            })
        }

        const missingSequences = _.filter(primerRecords, (p) => !p.sequence).length
        if (missingSequences > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `${missingSequences} record(s) are missing sequences`,
            })
        }

        const invalidSequenceTypes = _.filter(
            primerRecords,
            (p) => p.sequenceType && !['forward', 'reverse'].includes(p.sequenceType)
        )
        if (invalidSequenceTypes.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `Invalid sequence types found. Must be 'forward' or 'reverse': ${_.map(invalidSequenceTypes, 'name').join(', ')}`,
            })
        }

        // Validate against Zod schema (strip relationship/well fields before validation)
        const recordsForValidation = _.map(primerRecords, (record) =>
            _.omit(record, 'targetNames', 'plateStorageBoxName', 'wellTubeCoordinates')
        )

        try {
            _.forEach(recordsForValidation, (record) => {
                schemas.homologyArmPrimers.insert.parse(record)
            })
        } catch (zodError: any) {
            throw createError({
                statusCode: 400,
                statusMessage: zodError.message || 'Validation error',
                data: zodError.errors || [{ message: zodError.message }],
            })
        }

        // Perform bulk insert in a transaction
        const result = await db.transaction(async (tx) => {
            const insertedPrimers = await insertRecords(homologyArmPrimers, recordsForValidation, tx)

            // Create target relationships for each primer
            for (let i = 0; i < insertedPrimers.length; i++) {
                const primer = insertedPrimers[i]
                const rowTargetNames = primerRecords[i].targetNames

                if (rowTargetNames.length > 0) {
                    const targetIds = _.map(rowTargetNames, (name) => targetIdsByName[name]).filter(Boolean)
                    if (targetIds.length > 0) {
                        await updateRelatedTargets(
                            homologyArmPrimerTargets,
                            'homologyArmPrimerId',
                            'targetId',
                            primer.id,
                            targetIds,
                            tx
                        )
                    }
                }
            }

            // Assign primers to plate wells
            for (let i = 0; i < insertedPrimers.length; i++) {
                const orig = _.find(primerRecords, { name: insertedPrimers[i].name })
                const plateName = orig?.plateStorageBoxName
                const wellLocation = orig?.wellTubeCoordinates

                if (plateName && wellLocation) {
                    const wellId = await getWellIdFromPlateNameAndWellLocation(plateName, wellLocation, tx)
                    const wellContentCount = await wellContentsCount(wellId, tx)
                    if (wellContentCount > 0) {
                        throw createError({
                            statusCode: 400,
                            statusMessage: `Well '${wellLocation}' in '${plateName}' is already occupied. Please assign a different well or remove the existing contents, then try again.`,
                        })
                    }
                    if (wellId) {
                        await insertRecords(wellContents, [{ wellId, wellableId: insertedPrimers[i].id }], tx)
                    } else {
                        throw createError({
                            statusCode: 400,
                            statusMessage: `Could not find well for plate/storage box '${plateName}' and well location '${wellLocation}'`,
                        })
                    }
                }
            }

            return insertedPrimers
        })

        return {
            success: true,
            insertedCount: result.length,
            primers: result,
        }

    } catch (e: any) {
        const { error, data } = parsePutPostError(e)

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
            data: data,
        })
    }
})
