import _ from 'lodash'
import { wellContents, wellContentSources } from '~/server/db/schema/sge/well'
import { eq } from 'drizzle-orm'
import { deleteRecord } from '~/server/services/generic-services'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}

    try {
        // delete well content and sources, wrap in single transaction to prevent partial deletion
        const transactionResult = await db.transaction(async (tx) => {
            await db.delete(wellContentSources).where(eq(wellContentSources.wellContentId, id))
            const deletedRecord = await deleteRecord(wellContents, id)
            return deletedRecord
        })

        return transactionResult
    } catch (e: any) {
        await parseDeleteError(e, id)

        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
