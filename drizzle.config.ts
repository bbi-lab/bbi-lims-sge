import { defineConfig } from 'drizzle-kit'
const config = useRuntimeConfig()

export default defineConfig({
  schema: './server/db/schema/*',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.dbUrl
  },
})
