import { userGroupSchemas } from '@/server/db/schema/user'
import _ from 'lodash'
import { zodToJsonSchema } from 'zod-to-json-schema'

export default defineEventHandler(async (event) => {
    const { schema } = event.context.params as {schema: string}
    try {
        const currentSchema = userGroupSchemas[_.camelCase(schema)]
        
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
