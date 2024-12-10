import { schemas } from '@/server/db/schema/sge/zod'
import { relationsConfigs } from '@/server/db/schema/sge/relations'
import _ from 'lodash'
import { ZodObject, ZodTypeAny } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { type RelationsConfig } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
    const { recordType, schema } = event.context.params as {recordType: string, schema: string}
    const { id } = getQuery(event) as {id: string}
    
    try {
        const currentSchema = _.get(schemas, [_.camelCase(recordType), _.camelCase(schema)]) as ZodObject<any>
        
        // generate JSON Schema from Zod object
        const jsonSchema = zodToJsonSchema(currentSchema, { $refStrategy: 'none' })

        const relationsConfig = _.get(relationsConfigs, _.camelCase(recordType)) as RelationsConfig
        if (relationsConfig) await refineJsonSchema(jsonSchema, relationsConfig, id)

        return jsonSchema

    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
