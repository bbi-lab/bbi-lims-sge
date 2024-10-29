import zodToJsonSchema, { JsonSchema7AnyType, JsonSchema7ArrayType, JsonSchema7SetType, JsonSchema7Type } from "zod-to-json-schema"
import {getAllVerifiedUsersInfo, getUserGroups} from '@/server/services/user-services'
import { users } from '@/server/db/schema/user'
import _ from 'lodash'
import { RelationsConfig, getRecordsFromTable} from "./db"
import { PgTableWithColumns } from "drizzle-orm/pg-core"
import { createSelectSchema } from "drizzle-zod"

export async function refineJsonSchema(jsonSchema:JsonSchema7Type, relationsConfig: RelationsConfig) {

    // define JSON schema property as coded list of users, to be applied to JSON schema
    const usersInfo = await getAllVerifiedUsersInfo()
    const usersJsonSchemaProperty:JsonSchema7AnyType = {
      type: 'string',
      oneOf: [{ const: null, title: '(none)' }, ..._.map(usersInfo, (x) => { return { const: x.id, title: x.name } })],
    }

    // define JSON schema property to select a user group
    const userGroups = await getUserGroups()
    const userGroupsJsonSchemaProperty:JsonSchema7AnyType = {
      type: 'string',
      oneOf: _.map(userGroups, (x) => { return { const: x.id, title: x.name } }),
    }

    // iterate over properties and replace one-to-many relations with corresponding JsonSchema property
    const properties = _.get(jsonSchema, 'properties', [])
    for (const property in properties) {
      if (relationsConfig.one && Object.keys(relationsConfig.one).includes(property)) {
        if (_.get(relationsConfig.one, [property, 'referenceTable']) === users) {
          _.set(jsonSchema, ['properties', property], usersJsonSchemaProperty)
        }
      }
    }

    // iterate over many-to-many relations and add each to JSON schema as a new array property
    for (const [key, val] of Object.entries(relationsConfig.many)) {
      const items = await getRecordsFromTable(val.table)
      const itemsZodSchema = createSelectSchema(val.table)
      const itemsJsonSchema = zodToJsonSchema(itemsZodSchema)

      const jsonSchemaArrayProperty:JsonSchema7ArrayType = {
         type: 'array',
         items: itemsJsonSchema
      }
      _.set(jsonSchema, ['properties', key], jsonSchemaArrayProperty)
    }
}
