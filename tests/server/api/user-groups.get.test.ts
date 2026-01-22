import { setup } from '@nuxt/test-utils/e2e'
import { $fetch } from '@nuxt/test-utils'
import { describe, it } from 'vitest'
import { userGroupSchemas } from '@/server/db/schema/user'
import { generateTokens } from "~/server/utils/jwt"
import { v4 as uuidv4 } from 'uuid'

describe('API route: users-groups (GET)', async () => {
  await setup()

  it('should return user groups', async () => {
    const tokens = generateTokens(uuidv4())
    const res = await $fetch('/api/user-groups', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    })

    for (const group of res) {
      userGroupSchemas.selectUserGroupSchema.parse(group)
    }
  })
})
