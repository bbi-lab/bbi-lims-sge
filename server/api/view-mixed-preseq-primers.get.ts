import { selectRecordsFromView } from '~/server/services/generic-services'
import _ from 'lodash'
import { type QueryParams, type SelectParams, queryToSelectParams } from '../utils/restApi'
import { useDrizzle, schema } from '../utils/db'
import { type PgViewWithSelection } from 'drizzle-orm/pg-core'

export default defineEventHandler(async (event) => {
    const db = useDrizzle()

    try {
        const queryParams = getQuery(event) as QueryParams
        const selectParams = queryToSelectParams(queryParams) as SelectParams

        const view = schema.viewMixedPreseqPrimers as PgViewWithSelection<any, any, any>
        const results = await selectRecordsFromView(view, selectParams)

        const wellables = await db.query.wellables.findMany({
            where: (t, { inArray }) => inArray(t.id, results.map((r) => r.id)),
            with: {
                wellContents: {
                    with: {
                        well: {
                            with: {
                                plate: true
                            }
                        }
                    }
                }
            }
        })

        const wellableById = new Map(wellables.map((w) => [w.id, w]))
        return results.map((r) => ({ ...r, wellable: wellableById.get(r.id) }))

    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
