import { selectSpecimens } from '~/server/services/specimen-services'
import _ from 'lodash'

export default defineEventHandler(async (event) => {
    const queryParams = getQuery(event) as QueryParams
    const selectParams = queryToSelectParams(queryParams) as SelectParams

    try {
        return await selectSpecimens(selectParams)
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
