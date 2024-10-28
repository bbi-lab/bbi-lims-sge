import { schemas } from '@/server/db/schema/gene-group'
import _ from 'lodash'
import { getGeneGroupJsonSchema } from '@/server/services/gene-group-services'

export default defineEventHandler(async (event) => {
    const { name } = event.context.params as {name: string}
    try {
          if (_.has(schemas, _.camelCase(name))) {
            return getGeneGroupJsonSchema(_.camelCase(name))
          } else {
            throw createError({statusCode: 404, statusMessage: 'Unknown schema'})
          }
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
