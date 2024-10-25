import { schemas } from '@/server/db/schema/specimen'
import _ from 'lodash'
import { getSpecimenJsonSchema } from '@/server/services/specimen-services'

export default defineEventHandler(async (event) => {
    const { name } = event.context.params as {name: string}
    try {
          if (_.has(schemas, _.camelCase(name))) {
            return getSpecimenJsonSchema(_.camelCase(name))
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
