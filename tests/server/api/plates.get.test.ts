import { setup } from '@nuxt/test-utils/e2e'
import { $fetch } from '@nuxt/test-utils'
import { describe, it } from 'vitest'
import { schemas } from '~/server/db/schema/sge/zod'

describe('API route: plates (GET)', async () => {
  await setup({
    host: 'http://localhost:3001',
  })

  it('should return plates', async () => {
    const res = await $fetch('/api/plates')
    
    for (const plate of res) {
      schemas.plates.select.parse(plate)
    }
  })
})
