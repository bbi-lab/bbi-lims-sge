import { selectRecord } from '~/server/services/generic-services'
import _ from 'lodash'
import { wellContents } from '~/server/db/schema/sge/well'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params as {id: string}
    const queryParams = getQuery(event) as QueryParams
    const selectParams = queryToSelectParams(queryParams) as SelectParams

    try {
        const selectedWellContent = await selectRecord(
            _.get(db.query, 'wellContents'),
            wellContents,
            id,
            selectParams.with,
            selectParams.columns,
            queryParams.expandEnums == 'true' ? true : false
        )
        return selectedWellContent
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
