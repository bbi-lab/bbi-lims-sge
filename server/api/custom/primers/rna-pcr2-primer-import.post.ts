import _ from 'lodash'
import { v4 as uuid } from 'uuid'
import { rnaPreseq2Primers } from '~/server/db/schema/sge/primer'
import { schemas } from '~/server/db/schema/sge/zod'
import { insertRecords } from '~/server/services/generic-services'
import { getWellIdFromPlateNameAndWellLocation, plateStorageBoxNamesToIdsMap, targetNamesToIdsMap, updateRnaPreseq2PrimerTargets } from '~/server/utils/sge'
import { parsePutPostError } from '~/server/utils/restApi'
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

        // Extract and validate all unique target names
        const targetNames = _.uniq(
            _.flatMap(body, (row) => {
                // "targetNameS" (with capital S) is the key because the Excel template uses "Target Name(s)" as the column header and it gets camelCased
                const targetNameString = row.targetNameS || ''
                return _.map(
                    _.split(targetNameString, ','),
                    (name) => _.trim(name)
                ).filter(Boolean)
            })
        )

        if (targetNames.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No target names found in the uploaded data',
            })
        }

        // Query existing targets
        const targetIdsByName = await targetNamesToIdsMap(targetNames)

        // Check for missing targets
        const missingTargets = _.difference(targetNames, _.keys(targetIdsByName))
        if (missingTargets.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `Target names not found in database: ${missingTargets.join(', ')}`,
            })
        }

        // Extract and validate plate/storage box names
        const plateNames = _.uniq(
            _.map(body, (row) => _.trim(row.plateStorageBoxName || ''))
                .filter(Boolean)
        )

        const plateIdsByName = plateNames.length > 0 ? await plateStorageBoxNamesToIdsMap(plateNames) : {}

        // Check for missing plates
        const missingPlates = _.difference(plateNames, _.keys(plateIdsByName))
        if (missingPlates.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `Plate/storage box names not found in database: ${missingPlates.join(', ')}`,
            })
        }

        // Map and validate primer records
        const primerRecords = _.map(body, (row) => {
            // "targetNameS" (with capital S) is the key because the Excel template uses "Target Name(s)" as the column header and it gets camelCased
            const targetNameString = row.targetNameS || ''
            const primerTargetNames = _.map(
                _.split(targetNameString, ','),
                (name) => _.trim(name)
            ).filter(Boolean)

            return {
                id: uuid(),
                name: _.trim(row.primerName || row.name || ''),
                sequence: _.trim(row.sequence || ''),
                sequenceType: _.toLower(row.forwardReverse),
                adapterSequence: _.trim(row.adapterSequence || ''),
                orderedOn: row.orderedOn ? new Date(row.orderedOn) : null,
                notes: _.trim(row.notes || ''),
                targetNames: primerTargetNames,  // Keep for target relationship creation
                plateStorageBoxName: _.trim(row.plateStorageBoxName || ''), // Keep for assiging well contents
                wellTubeCoordinates: _.trim(row.wellTubeCoordinates || ''), // Keep for assigning well contents
            }
        })

        // Validate primer names are unique
        const duplicateNames = _.keys(_.pickBy(_.countBy(primerRecords, 'name'), (count) => count > 1))
        if (duplicateNames.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `Duplicate primer names found: ${duplicateNames.join(', ')}`,
            })
        }

        // Check for required fields
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

        const invalidSequenceTypes = _.filter(primerRecords, (p) => p.sequenceType && !['forward', 'reverse'].includes(p.sequenceType))
        if (invalidSequenceTypes.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `Invalid sequence types found. Must be 'forward' or 'reverse': ${_.map(invalidSequenceTypes, 'name').join(', ')}`,
            })
        }

        // Validate against Zod schema (remove targetNames field for schema validation)
        const recordsForValidation = _.map(primerRecords, (record) => _.omit(record, 'targetNames', 'plateStorageBoxName', 'wellTubeCoordinates'))

        try {
            _.forEach(recordsForValidation, (record) => {
                schemas.rnaPreseq2Primers.insert.parse(record)
            })
        } catch (zodError: any) {
            throw createError({
                statusCode: 400,
                statusMessage: zodError.message || 'Validation error',
                data: zodError.errors || [{ message: zodError.message }]
            })
        }

        // Perform bulk insert in transaction
        const result = await db.transaction(async (tx) => {
            // Insert primer records (without targetNames field)
            const insertedPrimers = await insertRecords(rnaPreseq2Primers, recordsForValidation, tx)

            // Create target relationships for each primer
            for (let i = 0; i < insertedPrimers.length; i++) {
                const primer = insertedPrimers[i]
                const targetNames = primerRecords[i].targetNames || []

                if (targetNames.length > 0) {
                    const targetIds = _.map(targetNames, (name) => targetIdsByName[name]).filter(Boolean)

                    if (targetIds.length > 0) {
                        await updateRnaPreseq2PrimerTargets(primer.id, targetIds, tx)
                    }
                }
            }

            // Assign primers to plate wells based on plateStorageBoxName and wellTubeCoordinates
            for (let i = 0; i < insertedPrimers.length; i++) {
                const insertedPrimerOrig = _.find(primerRecords, { name: insertedPrimers[i].name })
                const plateName = _.get(insertedPrimerOrig, 'plateStorageBoxName')
                const wellLocation = _.get(insertedPrimerOrig, 'wellTubeCoordinates')

                if (plateName && wellLocation) {
                    const wellId = await getWellIdFromPlateNameAndWellLocation(plateName, wellLocation)

                    if (wellId) {
                        await insertRecords(wellContents, [{
                            wellId,
                            wellableId: insertedPrimers[i].id,
                        }], tx)
                    } else {
                        throw createError({
                            statusCode: 400,
                            statusMessage: `Could not find well for plate/storage box '${plateName}' and well location '${wellLocation}''`
                        })
                    }
                }
            }
            return insertedPrimers
        })

        return {
            success: true,
            insertedCount: result.length,
            primers: result
        }

    } catch (e: any) {
        const { error, data } = parsePutPostError(e, 'rnaPreseq2Primers')

        throw createError({
            statusCode: error.statusCode || 400,
            statusMessage: error.message,
            data
        })
    }
})
