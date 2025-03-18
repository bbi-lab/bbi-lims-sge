import { setup } from '@nuxt/test-utils/e2e'
import { $fetch } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

describe('API route: users (GET)', async () => {
  await setup({
    host: 'http://localhost:3000',
  })

  it('should return a users', async () => {
    const res = await $fetch('/api/users')
    expect(res).toBeInstanceOf(Array)
  })
})
