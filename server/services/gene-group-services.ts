
import _ from 'lodash'
import {SelectParams} from '../utils/restApi'
import { schemas } from '@/server/db/schema/gene-group'
import { ZodObject } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { applySelectParamsToRecords } from '~/server/utils/restApi'

export async function selectGeneGroups(selectParams: SelectParams) {
    const allGeneGroups = await db.query.geneGroups.findMany({
        columns: selectParams.columns
    })
    return applySelectParamsToRecords(selectParams, allGeneGroups)
}

export const getGeneGroupJsonSchema = async (schemaName: string) => {
    if (_.has(schemas, schemaName)) {
        const currentSchema = schemas[schemaName] as ZodObject<any>

        // generate JSON Schema from Zod object
        const jsonSchema = zodToJsonSchema(currentSchema, { $refStrategy: 'none' })

        return jsonSchema
    }
    else {
        return null
    }
}
