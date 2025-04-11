import _ from 'lodash'
import { genes } from '~/server/db/schema/sge/gene'
import { ilike, and, or, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    try {
        const {where} = getQuery(event) as {where: string}

        // only supports search using search term on columns specified below (not JsonLogic where clause format)
        const searchTerm = _.get(JSON.parse(where), 'searchTerm')

        // to ensure uniqueness, filtering for protein-coding genes, where NCBI accession starts with NC_, and matching search term on symbol or ncbiAccession
        if (searchTerm) {
            const validGenes = await db.select({
                id: genes.id,
                symbol: genes.symbol,
                ncbiAccession: genes.ncbiAccession
            }).from(genes).where(
                and(
                    ilike(genes.ncbiAccession, 'NC_%'),
                    eq(genes.geneType, 'protein-coding'),
                    or(
                        ilike(genes.symbol, `${searchTerm}%`),
                        ilike(genes.ncbiAccession, `${searchTerm}%`),
                    )
                )
            )
            return validGenes
        } else {
            throw createError({
                statusCode: 400,
                statusMessage: 'No search term provided'
            })
        }
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            statusMessage: e.message
        })
    }
})
