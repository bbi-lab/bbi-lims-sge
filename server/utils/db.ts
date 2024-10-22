import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
const config = useRuntimeConfig()

export const db:PostgresJsDatabase = drizzle(postgres(config.dbUrl))
