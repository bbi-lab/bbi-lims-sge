import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
const config = useRuntimeConfig()
import { PgTableWithColumns, AnyPgColumn } from 'drizzle-orm/pg-core'
import * as userSchema from '@/server/db/schema/user';
import * as specimenSchema from '@/server/db/schema/specimen';
import * as geneGroupSchema from '@/server/db/schema/gene-group'
import * as pcrExperimentSchema from '@/server/db/schema/sge/pcr-experiment'

import {ZodObject} from 'zod'

export const db = drizzle(
  postgres(config.dbUrl),
  {
    schema: {
      ...userSchema,
      ...specimenSchema,
      ...geneGroupSchema,
      ...pcrExperimentSchema,
    }
  }
)

export interface RelationsConfig {
    one: {
      [relationName: string]: {
        fields: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        referenceTable: PgTableWithColumns<any>,
        references: [AnyPgColumn<any>, ...AnyPgColumn<any>[]]
      }
    },
    many: {
      [relationName: string]: {
        table: PgTableWithColumns<any>,
        schema: ZodObject<any>,
        fields: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        relationsConfig: RelationsConfig,
      }
    }
  }

export async function getRecordsFromTable (table: PgTableWithColumns<any>){
  const records = await db.select().from(table)
  return records
}
