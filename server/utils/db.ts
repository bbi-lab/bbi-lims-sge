import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export const db:PostgresJsDatabase = drizzle(postgres(process.env.DATABASE_URL!))
