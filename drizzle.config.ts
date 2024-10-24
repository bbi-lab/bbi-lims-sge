import { defineConfig } from 'drizzle-kit'
import process from 'node:process'

export default defineConfig({
  schema: './server/db/schema/*',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NUXT_DB_URL!
  },
})
