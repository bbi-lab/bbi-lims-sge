import { type NewWellContent } from '~/server/db/schema/sge/well'
import _ from 'lodash'
import { insertWellContentsAndSources } from '../services/well-content-services'
import { v4 as uuidv4 } from 'uuid'

export interface WellContentWithSource extends NewWellContent {
  id?: string,
  sourceWellIds?: string[]
  createdBy?: string
}

export default defineEventHandler<{ body: WellContentWithSource[] }>(async (event) => {
    try {
        const body = await readBody(event)

        const records = _.map(body, (x) => {
            const record = _.mapValues(x, (value: any) => _.isString(value) && _.isEmpty(value) ? null : value)
            record.id = uuidv4()
            return record
        }) as WellContentWithSource[]

        const newRecords = await insertWellContentsAndSources(records)
        return newRecords
    } catch (e: any) {
        const { error, data } = parsePutPostError(e, 'wellContents')

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
            data
        })
    }
})
