import { setup } from '@nuxt/test-utils/e2e'
import { $fetch } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import {schemas} from '@/server/db/schema/sge/zod'
import { generateTokens } from '~/server/utils/jwt'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import { useDrizzle } from '~/server/utils/db'
import { expectTypeOf } from 'vitest'

await setup()
const db = useDrizzle()

for (const recordType of Object.keys(db.query)) {
  describe(`API route: ${recordType} (GET)`, async () => {
    it('should return array of each record type defined in SGE zod module', async () => {
        const tokens = generateTokens(uuidv4())
        const res = await $fetch(`/api/${_.kebabCase(recordType)}`, {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`
          },
          query: {
            limit: 100
          },
        })

        // validate response against zod select schema if it exists
        const selectSchema = _.get(schemas, [recordType, 'select'])
        if (selectSchema) {
          for (const record of res) {
            selectSchema.parse(record)
          }
        } else {
          expect(Array.isArray(res)).toBe(true)
        }
    })
  })
}
