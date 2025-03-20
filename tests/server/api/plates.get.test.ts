import { setup } from '@nuxt/test-utils/e2e'
import { $fetch } from '@nuxt/test-utils'
import { describe, expectTypeOf, it } from 'vitest'
import { type Plate } from '@/server/db/schema/sge/plate'

describe('API route: plates (GET)', async () => {
  await setup({
    host: 'http://localhost:3000',
  })

  it('should return plates', async () => {
    const res = await $fetch('/api/plates')
    expectTypeOf(res).toEqualTypeOf<Plate[]>()
  })
})
