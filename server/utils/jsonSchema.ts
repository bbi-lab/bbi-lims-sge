import { JsonSchema7Type } from "zod-to-json-schema"
import {getAllVerifiedUsersInfo} from '@/server/services/user-services'
import { users } from '@/server/db/schema/user'
import _ from 'lodash'
import { RelationsConfig } from "./db"

export async function refineJsonSchema(jsonSchema:JsonSchema7Type, relationsConfig: RelationsConfig) {

    // define JSON schema property as coded list of users, to be applied to JSON schema
    const usersInfo = await getAllVerifiedUsersInfo()
    const usersJsonSchemaProperty = {
      type: 'string',
      oneOf: [{ const: null, title: '(none)' }, ..._.map(usersInfo, (x) => { return { const: x.id, title: x.name } })],
    }

    const properties = _.get(jsonSchema, 'properties', [])
    for (const property in properties) {
      if (relationsConfig.one && Object.keys(relationsConfig.one).includes(property)) {
        if (_.get(relationsConfig.one, [property, 'referenceTable']) === users) {
          _.set(jsonSchema, ['properties', property], usersJsonSchemaProperty)
        }
      }
    }
}
