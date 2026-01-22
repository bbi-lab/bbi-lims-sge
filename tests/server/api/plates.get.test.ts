import { setup } from '@nuxt/test-utils/e2e'
import { $fetch } from '@nuxt/test-utils'
import { describe, it } from 'vitest'
import { schemas } from '~/server/db/schema/sge/zod'
import { generateTokens } from '~/server/utils/jwt'
import { v4 as uuidv4 } from 'uuid'

describe('API route: plates (GET)', async () => {
  await setup()

  it('should return plates', async () => {
    const tokens = generateTokens(uuidv4())
    const res = await $fetch('/api/plates', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    })

    for (const plate of res) {
      schemas.plates.select.parse(plate)
    }
  })
})
