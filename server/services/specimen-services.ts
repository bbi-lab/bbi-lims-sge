
import { specimens, NewSpecimen, UpdateSpecimen} from '~/server/db/schema/specimen'
import { db } from '~/server/utils/db'
import { applySelectParamsToRecords } from '~/server/utils/restApi'
import { ZodObject } from 'zod'
import { schemas, specimensRelationsConfig } from '@/server/db/schema/specimen'
import { zodToJsonSchema } from 'zod-to-json-schema'
import _ from 'lodash'
import { eq } from 'drizzle-orm'

export async function selectSpecimens(selectParams: SelectParams) {
  const allSpecimens = await db.query.specimens.findMany({
      columns: selectParams.columns,
      with: selectParams.with
  })

  return applySelectParamsToRecords(selectParams, allSpecimens)
}

export async function insertSpecimen(values: NewSpecimen) {
  const [newSpecimen] = await db
    .insert(specimens)
    .values(values)
    .returning()

  return newSpecimen
}

export async function updateSpecimen(id: any, values: UpdateSpecimen) {
  const [updatedSpecimen] = await db
    .update(specimens)
    .set(values)
    .where(eq(specimens.id, id))
    .returning()

  return updatedSpecimen
}

export async function selectSpecimen(id: string, withClause?: any, columns?: any) {
  const [specimen] = await db.query.specimens.findMany(
    {
      where: () => eq(specimens.id, id),
      with: withClause,
      columns,
      limit: 1
    }
  )
  return specimen
}

export async function deleteSpecimen(id: any) {
  const [deletedSpecimen] = await db
    .delete(specimens)
    .where(eq(specimens.id, id))
    .returning({ id: specimens.id })

  return deletedSpecimen
}

export const getSpecimenJsonSchema = async (schemaName: string) => {
    if (_.has(schemas, schemaName)) {
      const currentSchema = schemas[schemaName] as ZodObject<any>
  
      // generate JSON Schema from Zod object
      const jsonSchema = zodToJsonSchema(currentSchema, { $refStrategy: 'none' })

      // refine JSON Schema based on relations
      await refineJsonSchema(jsonSchema, specimensRelationsConfig)

      return jsonSchema
    }
    else {
        return null
    }
  }
