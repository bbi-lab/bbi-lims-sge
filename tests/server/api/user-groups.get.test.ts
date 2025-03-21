import { setup } from '@nuxt/test-utils/e2e'
import { $fetch } from '@nuxt/test-utils'
import { describe, it } from 'vitest'
import { userGroupSchemas } from '@/server/db/schema/user'

describe('API route: users-groups (GET)', async () => {
  await setup({
    host: 'http://localhost:3001',
  })

  it('should return user groups', async () => {
    const res = await $fetch('/api/user-groups')

    for (const group of res) {
      userGroupSchemas.selectUserGroupSchema.parse(group)
    }
  })
})
