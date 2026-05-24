import _ from 'lodash'
import { v4 as uuid } from 'uuid'
import { inArray } from 'drizzle-orm'
import { homologyArmPrimers, homologyArmPuc19Primers } from '~/server/db/schema/sge/primer'
import { schemas } from '~/server/db/schema/sge/zod'
import { insertRecords, type RecordValues } from '~/server/services/generic-services'
import { getWellIdFromPlateNameAndWellLocation, plateStorageBoxNamesToIdsMap, wellContentsCount } from '~/server/utils/sge'
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

        // Extract unique HA primer names from the rows
        const haPrimerNames = _.uniq(
            _.map(body, (row) => _.trim(row.haPrimerName || row.homologyArmPrimerName || ''))
                .filter(Boolean)
        )

        if (haPrimerNames.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No HA primer names found in the uploaded data (expected column: HA Primer Name)',
            })
        }

        // Fetch HA primers by name
        const haPrimerRecords = await db
            .select()
            .from(homologyArmPrimers)
            .where(inArray(homologyArmPrimers.name, haPrimerNames))

        const haPrimersByName = _.keyBy(haPrimerRecords, 'name')

        const missingHaPrimers = _.difference(haPrimerNames, _.keys(haPrimersByName))
        if (missingHaPrimers.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `HA primer names not found in database: ${missingHaPrimers.join(', ')}`,
            })
        }

        // Extract plate/storage box names for validation
        const plateNames = _.uniq(
            _.map(body, (row) => _.trim(row.plateStorageBoxName || ''))
                .filter(Boolean)
        )

        const plateIdsByName = plateNames.length > 0
            ? await plateStorageBoxNamesToIdsMap(plateNames, 'ha-puc19-primer-storage')
            : {}

        const missingPlates = _.difference(plateNames, _.keys(plateIdsByName))
        if (missingPlates.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `HA pUC19 primer storage plates not found in database: ${missingPlates.join(', ')}`,
            })
        }

        // Build records
        const primerRecords = _.map(body, (row) => {
            const haPrimerName = _.trim(row.haPrimerName || row.homologyArmPrimerName || '')
            const haPrimer = haPrimersByName[haPrimerName]

            // Auto-calculate name unless explicitly provided
            const autoName = _.replace(
                _.replace(haPrimer.name, /_F$/gi, '_pUC19_F'),
                /_R$/gi,
                '_pUC19_R'
            )

            // Auto-calculate sequence unless explicitly provided
            let autoSequence = ''
            if (haPrimer.sequenceType === 'forward') {
                autoSequence = `GTTTTCCCAGTCACGACGTTGTAAAACGACGGCCAGT${haPrimer.sequence || ''}`
            } else if (haPrimer.sequenceType === 'reverse') {
                autoSequence = `GATTACGCCAAGCTTGCATGCCTGCAGGT${haPrimer.sequence || ''}`
            }

            return {
                id: uuid(),
                homologyArmPrimerId: haPrimer.id,
                name: _.trim(row.name || '') || autoName,
                sequence: _.trim(row.sequence || '') || autoSequence,
                orderedOn: row.orderedOn ? new Date(row.orderedOn) : null,
                notes: _.trim(row.notes || ''),
                // kept for well assignment, omitted from DB insert
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

        // Validate against Zod schema
        const recordsForValidation = _.map(primerRecords, (record) =>
            _.omit(record, 'plateStorageBoxName', 'wellTubeCoordinates')
        ) as Array<RecordValues>

        try {
            _.forEach(recordsForValidation, (record) => {
                schemas.homologyArmPuc19Primers.insert.parse(record)
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
            const insertedPrimers = await insertRecords(homologyArmPuc19Primers, recordsForValidation, tx)

            // Assign to plate wells
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
                            statusMessage: `Well '${wellLocation}' in '${plateName}' is already occupied.`
                        })
                    }
                    if (wellId) {
                        await insertRecords(wellContents, [{ wellId, wellableId: insertedPrimers[i].id }], tx)
                    } else {
                        throw createError({
                            statusCode: 400,
                            statusMessage: `Could not find well for plate/storage box '${plateName}' and well location '${wellLocation}'`
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
