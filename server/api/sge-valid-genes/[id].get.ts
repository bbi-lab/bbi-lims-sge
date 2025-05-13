import _ from 'lodash'
import { genes } from '~/server/db/schema/sge/gene'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}

    try {
        const sgeGene = db.query.genes.findFirst({
            where: eq(genes.id, id)
        })
        return sgeGene
    } catch (e: any) {
        throw createError({
            statusCode: 404,
            statusMessage: e.message
        })
    }
})
