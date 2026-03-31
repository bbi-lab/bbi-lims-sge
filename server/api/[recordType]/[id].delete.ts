import _ from 'lodash'
import { parseDeleteError } from '~/server/utils/restApi'
import { eq } from 'drizzle-orm'
import { transfectTargets } from '~/server/db/schema/sge/transfect-experiment'
import { homologyArmPrimerTargets, preseq1PrimerTargets, rnaPreseq1PrimerTargets, rnaPreseq2PrimerTargets } from '~/server/db/schema/sge/primer'
import { plates } from '~/server/db/schema/sge/plate'
import { deleteEmptyPlate } from '~/server/utils/sge'
import { pcrExperiments, pcrExperimentTargets } from '~/server/db/schema/sge/pcr-experiment'

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

        const deletedRecord = await db.transaction(async (tx) => {
            // auto-delete dependent child records that are managed as part of parent
            if (_.camelCase(recordType) == 'transfectExperiments') {
                await tx.delete(transfectTargets).where(eq(transfectTargets.experimentId, id))
            } else if (_.camelCase(recordType) == 'homologyArmPrimers') {
                await tx.delete(homologyArmPrimerTargets).where(eq(homologyArmPrimerTargets.homologyArmPrimerId, id))
            } else if (_.camelCase(recordType) == 'preseq1Primers') {
                await tx.delete(preseq1PrimerTargets).where(eq(preseq1PrimerTargets.preseq1PrimerId, id))
            } else if (_.camelCase(recordType) == 'rnaPreseq1Primers') {
                await tx.delete(rnaPreseq1PrimerTargets).where(eq(rnaPreseq1PrimerTargets.rnaPreseq1PrimerId, id))
            } else if (_.camelCase(recordType) == 'rnaPreseq2Primers') {
                await tx.delete(rnaPreseq2PrimerTargets).where(eq(rnaPreseq2PrimerTargets.rnaPreseq2PrimerId, id))
            } else if (_.camelCase(recordType) == 'pcrExperiments') {

                // delete assiociated targets
                await tx.delete(pcrExperimentTargets).where(eq(pcrExperimentTargets.pcrExperimentId, id))
            }

            const deleteResult = await tx.delete(table)
                .where(eq(table.id, id))
                .returning()

            if (_.camelCase(recordType) == 'pcrExperiments') {
                // delete associated plates if all wells are empty
                const plateId = _.get(deleteResult, '0.plateId')
                if (plateId) await deleteEmptyPlate(plateId, tx)
            }
            return _.get(deleteResult, '0')
        })

        return deletedRecord
    } catch (e: any) {
        await parseDeleteError(e)
        throw createError({
            statusCode: 400,
            statusMessage: e.statusMessage || e.message,
        })
    }
})
