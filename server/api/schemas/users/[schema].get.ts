import { schemas, usersRelationsConfig } from '@/server/db/schema/user'
import _ from 'lodash'
import { zodToJsonSchema } from 'zod-to-json-schema'

export default defineEventHandler(async (event) => {
    const { schema } = event.context.params as {schema: string}
    const { id } = getQuery(event) as {id: string}

    console.log(schema)
    try {
        const currentSchema = schemas[_.camelCase(schema)]
        
        // generate JSON Schema from Zod object
        const jsonSchema = zodToJsonSchema(currentSchema, { $refStrategy: 'none' })

        // refine JSON Schema based on relations
        // including ID from query params to set as default in related records
        await refineJsonSchema(jsonSchema, usersRelationsConfig, id)

        return jsonSchema
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
