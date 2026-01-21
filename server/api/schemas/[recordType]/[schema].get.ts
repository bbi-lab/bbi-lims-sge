import { schemas } from '@/server/db/schema/sge/zod'
import { relationsConfigs } from '@/server/db/schema/sge/relations'
import _ from 'lodash'
import { ZodObject, ZodTypeAny } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { type RelationsConfig } from '~/server/utils/db'
import { ENUM_LOOKUPS, type EnumLookup } from '~/server/db/schema/sge/enum-lookups'

export default defineEventHandler(async (event) => {
    const { recordType, schema } = event.context.params as {recordType: string, schema: string}
    const { id } = getQuery(event) as {id: string}

    try {
        const currentSchema = _.get(schemas, [_.camelCase(recordType), _.camelCase(schema)]) as ZodObject<any>

        // generate JSON Schema from Zod object
        const jsonSchema = zodToJsonSchema(currentSchema, { $refStrategy: 'none' })

        console.log('Generated JSON Schema:', JSON.stringify(jsonSchema, null, 2))
        const relationsConfig = _.get(relationsConfigs, _.camelCase(recordType)) as RelationsConfig
        const enumLookups = _.get(ENUM_LOOKUPS, _.camelCase(recordType), {}) as EnumLookup

        if (relationsConfig) await refineJsonSchema(jsonSchema, relationsConfig, id, enumLookups)

        return jsonSchema

    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
