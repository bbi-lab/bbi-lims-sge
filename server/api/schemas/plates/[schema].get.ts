import { schemas } from '@/server/db/schema/sge/plate'
import _ from 'lodash'
import { zodToJsonSchema } from 'zod-to-json-schema'

export default defineEventHandler(async (event) => {
    const { schema } = event.context.params as {schema: string}
    try {
        const currentSchema = schemas[_.camelCase(schema)]
        
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
