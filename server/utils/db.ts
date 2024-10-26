import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
const config = useRuntimeConfig()
import { PgTableWithColumns, AnyPgColumn } from 'drizzle-orm/pg-core'

export const db:PostgresJsDatabase = drizzle(postgres(config.dbUrl))

export interface RelationsConfig {
    one: {
      [fieldName: string]: {
        fields: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        referenceTable: PgTableWithColumns<any>,
        references: [AnyPgColumn<any>, ...AnyPgColumn<any>[]]
      }
    },
    many: {
      [fieldName: string]: {
        fields: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        referenceTable: PgTableWithColumns<any>,
        references: [AnyPgColumn<any>, ...AnyPgColumn<any>[]]
      }
    }
  }
