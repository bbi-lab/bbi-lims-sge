import { schemas } from '@/server/db/schema/sge/zod'
import _ from 'lodash'
import { ZodObject, ZodTypeAny } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

export default defineEventHandler(async (event) => {
    const { recordType, schema } = event.context.params as {recordType: string, schema: string}
    try {
        const currentSchema = _.get(schemas, [recordType, _.camelCase(schema)]) as ZodObject<any>
        
        // generate JSON Schema from Zod object
        const jsonSchema = zodToJsonSchema(currentSchema, { $refStrategy: 'none' })
        return jsonSchema

    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
