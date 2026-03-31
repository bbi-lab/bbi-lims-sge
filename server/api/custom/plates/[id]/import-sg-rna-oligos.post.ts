

import { inArray, eq } from 'drizzle-orm'
import _ from 'lodash'
import { ZodObject } from 'zod'
import { wellCharToCoordinate } from '~/lib/plate-diagram'
import { sgRnaOligos } from '~/server/db/schema/sge/oligos'
import { targets } from '~/server/db/schema/sge/target'
import { wellContents, wells } from '~/server/db/schema/sge/well'
import { schemas } from '~/server/db/schema/sge/zod'
import { insertRecords, selectRecords } from '~/server/services/generic-services'
import { v4 as uuid } from 'uuid'

export default defineEventHandler(async (event) => {
    const { id: plateId } = event.context.params as {id: string}

    try {
        const body = await readBody(event)

        const targetNames = _.uniq(_.map(body, (x) => {
            const targetName = _.split(x.sequenceName, '_', 2)
            return targetName.join('_')
        }))

        const db = useDrizzle()

        const targetRecords = await db.query.targets.findMany({
            columns: {
                id: true,
                name: true,
            },
            where: inArray(targets.name, targetNames),
        })
        const targetRecordsById = _.keyBy(targetRecords, 'name')

        const recordsMapped = _.map(body, (x) => {
            const targetName = _.split(x.sequenceName, '_', 2).join('_')
            const targetId = _.get(targetRecordsById, [targetName, 'id'])
            const directionMap = {
                'W': 'forward',
                'C': 'reverse',
            }
            const yCoord = wellCharToCoordinate(x.wellPosition.charAt(0))
            const xCoord = parseInt(x.wellPosition.slice(1))
            return {
                id: uuid(),
                targetId,
                targetName: targetName,
                name: x.sequenceName,
                sequence: x.sequence,
                xCoordinate: _.inRange(xCoord, 1, 13) ? xCoord : null,
                yCoordinate: _.inRange(yCoord, 1, 9) ? yCoord : null,
                direction: _.get(directionMap, _.last(_.split(x.sequenceName, '_')) || ''),
            }
        })
        if (_.some(recordsMapped, (x) => !x.targetId)) {
            throw createError({
                statusCode: 400,
                statusMessage: `Missing targets: ${_.uniq(_.map(_.filter(recordsMapped, (x) => !x.targetId), 'targetName')).join(', ')}`,
            })
        } else if (_.some(recordsMapped, (x) => !x.direction)) {
            throw createError({
                statusCode: 400,
                statusMessage: `Could not determine direction for oligos: ${_.uniq(_.map(_.filter(recordsMapped, (x) => !x.direction), 'name')).join(', ')}`,
            })
        } else if (_.some(recordsMapped, (x) => !x.sequence)) {
            throw createError({
                statusCode: 400,
                statusMessage: `Missing sequences for some records: ${_.uniq(_.map(_.filter(recordsMapped, (x) => !x.sequence), 'name')).join(', ')}    `,
            })
        } else if (_.some(recordsMapped, (x) => !x.xCoordinate || !x.yCoordinate)) {
            throw createError({
                statusCode: 400,
                statusMessage: `Invalid coordinates for some records: ${_.uniq(_.map(_.filter(recordsMapped, (x) => !x.xCoordinate || !x.yCoordinate), 'name')).join(', ')}`,
            })
        } else if (_.some(recordsMapped, (x) => !x.name)) {
            throw createError({
                statusCode: 400,
                statusMessage: `Missing names for some records`,
            })
        } else if (_.some(_.values(_.countBy(recordsMapped, 'name')), (x) => x > 1)) {
            throw createError({
                statusCode: 400,
                statusMessage: `Multiple records found with the same name: ${_.keys(_.pickBy(_.countBy(recordsMapped, 'name'), (count) => count > 1)).join(', ')}`,
            })
        } else if (_.some(_.values(_.countBy(recordsMapped, (x) => `${x.yCoordinate}${x.xCoordinate}`)), (count) => count > 2)) {
            const overloadedWells = _.pickBy(_.countBy(recordsMapped, (x) => `${x.yCoordinate}${x.xCoordinate}`), (count) => count > 2)
            throw createError({
                statusCode: 400,
                statusMessage: `More than two oligos assigned to well(s): ${_.keys(overloadedWells).join(', ')}`,
            })
        }

        // wrap inserts into transaction to automatically roll back if any fail
        const newOligos = await db.transaction(async (tx) => {
            const newOligoRecords = await insertRecords(sgRnaOligos, recordsMapped, tx)

            const plateWells = await tx.query.wells.findMany({
                columns: {
                    id: true,
                    x: true,
                    y: true,
                },
                where: eq(wells.plateId, plateId),
            })

            // assign oligo ids to wells by coordinates
            const plateWellsByCoordinates = _.keyBy(plateWells, (x) => `${x.x}_${x.y}`)
            const oligoWells = _.map(recordsMapped, (x) => {
                const wellKey = `${x.xCoordinate}_${x.yCoordinate}`
                const wellRecord = plateWellsByCoordinates[wellKey]
                if (!wellRecord) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: `No well found for coordinates ${wellKey} for oligo ${x.name}`,
                    })
                }
                return {
                    wellId: wellRecord.id,
                    wellableId: x.id,
                }
            })

            // insert well content records
            try {
                await insertRecords(wellContents, oligoWells, tx)
            } catch (e: any) {
                throw createError({
                    statusCode: 400,
                    statusMessage: `Failed to insert well contents for oligos: ${e.message}`,
                })
            }
            return newOligoRecords
        })

        return newOligos
    } catch (e: any) {
        const { error, data } = parsePutPostError(e)

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
            data
        })
    }
})
