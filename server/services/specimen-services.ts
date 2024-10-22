
import { specimens, NewSpecimen, UpdateSpecimen} from '~/server/db/schema/specimen'
import { db } from '~/server/utils/db'
import {ZodObject} from 'zod'
import {
    insertSpecimenSchema,
    selectSpecimenSchema,
    updateSpecimenSchema,
  } from '@/server/db/schema/specimen'
import { zodToJsonSchema } from 'zod-to-json-schema'
import _ from 'lodash'
import { eq } from 'drizzle-orm'

export async function getAllSpecimens() {
    return await db.select().from(specimens)
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

export const getSpecimenSchema = (schemaName: any) => {
    const schemaMap: Record<string, ZodObject<any>> = {
      select: selectSpecimenSchema,
      update: updateSpecimenSchema,
      insert: insertSpecimenSchema,
    }
  
    if (_.has(schemaMap, schemaName)) {
      const currentSchema = schemaMap[schemaName]
  
      // auto-generate JSON Schema from Zod object
      const jsonSchema = currentSchema ? zodToJsonSchema(currentSchema, { $refStrategy: 'none' }) : null
  
      return jsonSchema
    }
    else {
        return null
    }
  }
