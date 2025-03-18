import { setup } from '@nuxt/test-utils/e2e'
import { $fetch } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

describe('API route: users-groups (GET)', async () => {
  await setup({
    host: 'http://localhost:3000',
  })

  it('should return user groups', async () => {
    const res = await $fetch('/api/user-groups')
    expect(res).toBeInstanceOf(Array)
  })
})
