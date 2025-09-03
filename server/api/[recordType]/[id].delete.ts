// import { deleteRecord } from '~/server/services/generic-services'
import _ from 'lodash'
import { parseDeleteError } from '~/server/utils/restApi'
import { eq } from 'drizzle-orm'
import { transfectTargets } from '~/server/db/schema/sge/transfect-experiment'
import { homologyArmPrimers, homologyArmPrimerTargets } from '~/server/db/schema/sge/primer'

export default defineEventHandler(async (event) => {
    const { recordType, id } = event.context.params as {recordType: string, id: string}
    if (recordType != _.kebabCase(recordType)) {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid record type: ${recordType}. Record type must be kebab-case.`
        })
    }

    try {
         // requires relevant schema to have been passed on drizzle db init
        const table = _.get(db, ['query', _.camelCase(recordType), 'table'])

        if (!table) throw createError({
            statusCode: 500,
            statusMessage: `Could not find table, check to make sure ${_.camelCase(recordType)} is included in drizzle db schemas`
        })

        const deletedRecord = db.transaction(async (tx) => {
            // auto-delete dependent child records that are managed as part of parent
            if (_.camelCase(recordType) == 'transfectExperiments') {
                await tx.delete(transfectTargets).where(eq(transfectTargets.experimentId, id))
            } else if (_.camelCase(recordType) == 'homologyArmPrimers') {
                await tx.delete(homologyArmPrimerTargets).where(eq(homologyArmPrimerTargets.homologyArmPrimerId, id))
            }

            const deleteResult = await tx.delete(table)
                .where(eq(table.id, id))
                .returning()
            return _.get(deleteResult, '0')
        })

        return deletedRecord
    } catch (e: any) {
        await parseDeleteError(e, id)

        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
