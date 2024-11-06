import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { PgTableWithColumns, AnyPgColumn } from 'drizzle-orm/pg-core'
import {users, userGroups, userGroupMemberships} from '../db/schema/user';

import {specimens} from '../db/schema/specimen';
import {geneGroups} from '../db/schema/gene-group'
import {pcrExperiments} from '../db/schema/sge/pcr-experiment'
import {plates} from '../db/schema/sge/plate'
import {wells} from '../db/schema/sge/well'
import {pcrExperimentsRelations, platesRelations, wellsRelations} from '../db/schema/sge/relations'
import { relations } from 'drizzle-orm'
import {ZodObject} from 'zod'
import _ from 'lodash'


// By checking whether useRuntimeConfig is defined, we support use outside the Nuxt lifecycle.
const config = typeof useRuntimeConfig == 'undefined' ? undefined : useRuntimeConfig()

export const db = drizzle(
  postgres(config?.dbUrl || process.env.NUXT_DB_URL),
  {
    schema: {
      users,
      userGroups,
      userGroupMemberships,
      specimens,
      geneGroups,
      pcrExperiments,
      plates,
      wells,
      platesRelations,
      pcrExperimentsRelations,
      wellsRelations,
    }
  }
)

export interface RelationsConfig {
    one: {
      [relationName: string]: {
        fields: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        referenceTable: PgTableWithColumns<any>,
        references: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        relationName?: string,
      }
    },
    many: {
      [relationName: string]: {
        table: PgTableWithColumns<any>,
        schema: ZodObject<any>,
        fields: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        relationsConfig?: RelationsConfig,
        relationName?: string,
      }
    }
  }

// export function relationsConfigToRelations(table: PgTableWithColumns<any>, relationsConfig: RelationsConfig) {
//   return relations(table, ({ one, many }) => (
//     {
//         ..._.mapValues(relationsConfig.one, (x) => {
//             return one(x.referenceTable, {
//               fields: x.fields,
//               references: x.references,
//             })
//         }),
//         ..._.mapValues(relationsConfig.many, (x) => {
//             if (x.relationName) {
//                 return many(x.table, {relationName: x.relationName})
//             } else {
//                 return many(x.table)
//             }
//         })
//     }
// ))
// }
export async function getRecordsFromTable (table: PgTableWithColumns<any>){
  const records = await db.select().from(table)
  return records
}
