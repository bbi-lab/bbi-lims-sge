import { deleteRecord } from '~/server/services/generic-services'
import { eq, or, and, isNotNull } from 'drizzle-orm'
import { plates } from '~/server/db/schema/sge/plate'
import { wellContents, wells } from '~/server/db/schema/sge/well'
import { deleteEmptyPlate } from '~/server/utils/sge'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}

    try {
        return await deleteEmptyPlate(id)
    } catch (e: any) {
        await parseDeleteError(e)

        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
