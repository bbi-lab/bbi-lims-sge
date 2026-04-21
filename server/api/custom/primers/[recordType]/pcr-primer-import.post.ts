import _ from 'lodash'
import { v4 as uuid } from 'uuid'
import { rnaPreseq2Primers, rnaPreseq1Primers, preseq2Primers, preseq1Primers, rnaPreseq1PrimerTargets, rnaPreseq2PrimerTargets, preseq1PrimerTargets, homologyArmPrimers, homologyArmPrimerTargets } from '~/server/db/schema/sge/primer'
import { schemas } from '~/server/db/schema/sge/zod'
import { insertRecords } from '~/server/services/generic-services'
import { getWellIdFromPlateNameAndWellLocation, plateStorageBoxNamesToIdsMap, targetNamesToIdsMap, updateRelatedTargets, wellContentsCount } from '~/server/utils/sge'
import { wellContents } from '~/server/db/schema/sge/well'
import { PgTable } from 'drizzle-orm/pg-core'
import { ENUM_LOOKUPS } from '~/server/db/schema/sge/enum-lookups'

// Configuration for processing different primer record types
const RECORD_TYPE_CONFIG_MAP = {
    'rna-preseq1-primers': {
        table: rnaPreseq1Primers,
        zodSchema: schemas.rnaPreseq1Primers.insert,
        updateRelatedTargetParams: {
            table: rnaPreseq1PrimerTargets,
            parentIdKey: 'rnaPreseq1PrimerId',
            targetIdKey: 'targetId',
        },
        plateType: 'rna-preseq-1-primer-storage'
    },
    'rna-preseq2-primers': {
        table: rnaPreseq2Primers,
        zodSchema: schemas.rnaPreseq2Primers.insert,
        updateRelatedTargetParams: {
            table: rnaPreseq2PrimerTargets,
            parentIdKey: 'rnaPreseq2PrimerId',
            targetIdKey: 'targetId',
        },
        plateType: 'rna-preseq-2-primer-storage'
    },
    'preseq1-primers': {
        table: preseq1Primers,
        zodSchema: schemas.preseq1Primers.insert,
        updateRelatedTargetParams: {
            table: preseq1PrimerTargets,
            parentIdKey: 'preseq1PrimerId',
            targetIdKey: 'targetId',
        },
        plateType: 'dna-preseq-1-primer-storage'
    },
    'preseq2-primers': {
        table: preseq2Primers,
        zodSchema: schemas.preseq2Primers.insert,
        plateType: 'dna-preseq-2-primer-storage'
    },
    'ha-primers': {
        table: homologyArmPrimers,
        zodSchema: schemas.homologyArmPrimers.insert,
        updateRelatedTargetParams: {
            table: homologyArmPrimerTargets,
            parentIdKey: 'homologyArmPrimerId',
            targetIdKey: 'targetId',
        },
        plateType: 'ha-primer-storage'
    },
}

export default defineEventHandler(async (event) => {
    try {
        const { recordType } = event.context.params as {recordType: string}

        const recordTypeConfig = _.get(RECORD_TYPE_CONFIG_MAP, recordType)
        if (!recordTypeConfig) {
            throw createError({
                statusCode: 400,
                statusMessage: `Invalid record type: ${recordType}.`
            })
        }

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

        const plateIdsByName = plateNames.length > 0 ? await plateStorageBoxNamesToIdsMap(plateNames, recordTypeConfig.plateType) : {}

        // Check for missing plates
        const missingPlates = _.difference(plateNames, _.keys(plateIdsByName))
        if (missingPlates.length > 0) {
            const plateTypeName = _.get(ENUM_LOOKUPS.plates.plateType, [recordTypeConfig.plateType, 'label'])
            throw createError({
                statusCode: 400,
                statusMessage: `${plateTypeName} not found in database: ${missingPlates.join(', ')}`,
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

            const primerRecord = {
                id: uuid(),
                name: _.trim(row.primerName || row.name || ''),
                sequence: _.trim(row.sequence || ''),
                sequenceType: _.toLower(row.forwardReverse),
                orderedOn: row.orderedOn ? new Date(row.orderedOn) : null,
                notes: _.trim(row.notes || ''),
                targetNames: primerTargetNames,  // Keep for target relationship creation
                plateStorageBoxName: _.trim(row.plateStorageBoxName || ''), // Keep for assiging well contents
                wellTubeCoordinates: _.trim(row.wellTubeCoordinates || ''), // Keep for assigning well contents
            }
            // preseq1 primers do not include adapter sequences, so only set if present in the row
            if (_.has(row, 'adapterSequence')) {
                _.set(primerRecord, 'adapterSequence', _.trim(row.adapterSequence || ''))
            }
            // ha-primers optionally include cloning strategy
            if (_.has(row, 'cloningStrategy') && row.cloningStrategy) {
                _.set(primerRecord, 'cloningStrategy', _.toLower(_.trim(row.cloningStrategy || '')))
            }
            return primerRecord
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
                recordTypeConfig.zodSchema.parse(record)
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
            const primerTable: PgTable<any> = recordTypeConfig.table
            // const primerTargetRelationshipUpdater: Function | null = recordTypeConfig.targetRelationshipUpdater

            // Insert primer records (without targetNames field)
            const insertedPrimers = await insertRecords(primerTable, recordsForValidation, tx)

            // Create target relationships for each primer
            for (let i = 0; i < insertedPrimers.length; i++) {
                const primer = insertedPrimers[i]
                const targetNames = primerRecords[i].targetNames || []

                if (targetNames.length > 0 && _.has(recordTypeConfig, 'updateRelatedTargetParams')) {
                    const targetIds = _.map(targetNames, (name) => targetIdsByName[name]).filter(Boolean)

                    if (targetIds.length > 0) {
                        await updateRelatedTargets(
                            recordTypeConfig.updateRelatedTargetParams.table,
                            recordTypeConfig.updateRelatedTargetParams.parentIdKey,
                            recordTypeConfig.updateRelatedTargetParams.targetIdKey,
                            primer.id,
                            targetIds,
                            tx
                        )
                    }
                }
            }

            // Assign primers to plate wells based on plateStorageBoxName and wellTubeCoordinates
            for (let i = 0; i < insertedPrimers.length; i++) {
                const insertedPrimerOrig = _.find(primerRecords, { name: insertedPrimers[i].name })
                const plateName = _.get(insertedPrimerOrig, 'plateStorageBoxName')
                const wellLocation = _.get(insertedPrimerOrig, 'wellTubeCoordinates')

                if (plateName && wellLocation) {
                    const wellId = await getWellIdFromPlateNameAndWellLocation(plateName, wellLocation, tx)
                    const wellContentCount = await wellContentsCount(wellId, tx)
                    if (wellContentCount > 0) {
                        throw createError({
                            statusCode: 400,
                            statusMessage: `Well '${wellLocation}' in '${plateName}' is already occupied. Please assign a different well or remove the existing contents, then try again.`
                        })
                    }
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
        const  { error, data } = parsePutPostError(e)

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
            data: data
        })
    }
})
