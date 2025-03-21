import { setup } from '@nuxt/test-utils/e2e'
import { $fetch } from '@nuxt/test-utils'
import { describe, it } from 'vitest'
import { schemas } from '@/server/db/schema/user'

describe('API route: users (GET)', async () => {
  await setup({
    host: 'http://localhost:3001',
  })

  it('should return a users', async () => {
    const res = await $fetch('/api/users')
    for (const user of res) {
      schemas.selectUserSchema.parse(user)
    }
  })
})
