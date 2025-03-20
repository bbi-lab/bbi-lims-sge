import { setup } from '@nuxt/test-utils/e2e'
import { $fetch } from '@nuxt/test-utils'
import { describe, expectTypeOf, it } from 'vitest'
import { z } from 'zod'
import {schemas} from '@/server/db/schema/sge/zod'

describe('API route: [record-type] (GET)', async () => {
  await setup({
    host: 'http://localhost:3000',
  })

  it('should return array of each record type defined in SGE zod module', async () => {
    for (const recordType of Object.keys(schemas)) {
        const res = await $fetch(`/api/${recordType}`)
        const selectSchema =  schemas[recordType].select
        type selectType = z.infer<typeof selectSchema>
        
        expectTypeOf(res).toEqualTypeOf<selectType[]>()
    }
  })
})
