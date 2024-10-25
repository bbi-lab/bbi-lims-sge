
import { specimens, NewSpecimen, UpdateSpecimen} from '~/server/db/schema/specimen'
import { db } from '~/server/utils/db'
import { ZodObject } from 'zod'
import { schemas, specimensRelationsConfig } from '@/server/db/schema/specimen'
import { zodToJsonSchema } from 'zod-to-json-schema'
import _ from 'lodash'
import { eq } from 'drizzle-orm'
import jsonLogic from 'json-logic-js'

export async function getAllSpecimens() {
    return await db.select().from(specimens)
}

export async function selectSpecimens(query:any) {
  const allSpecimens = await db.select().from(specimens)

  // wrapping Json logic query with this so that it will be applied to every item in array
  // (e.g. query for filtering on property name=='test' would be {"==":[{"var":"name"},"test"]} )
  const queryFinal  = query ? {filter:[{var:""}, query]} : null
  
  // TODO - apply filter logic as where clause on query above
  return queryFinal ? jsonLogic.apply(queryFinal, allSpecimens) || [] : allSpecimens
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

export async function selectSpecimen(id: any) {
  const [updatedSpecimen] = await db
  .select()
  .from(specimens)
  .where(eq(specimens.id, id))

  return updatedSpecimen
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
