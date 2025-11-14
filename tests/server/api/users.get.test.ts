import { describe, expect, it } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { setup } from '@nuxt/test-utils/e2e'
import { generateTokens } from "~/server/utils/jwt"
import { v4 as uuidv4 } from 'uuid'

describe('API route: users (GET)', async () => {
  await setup()

  it('return success response for valid request', async () => {
    const tokens = generateTokens(uuidv4())
    const res = await $fetch('/api/users', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    })
    expect(res).toBeDefined()
    expect(Array.isArray(res)).toBe(true)

  })
})
