import { wellContentSources, wellContents} from '~/server/db/schema/sge/well'

import { db } from '~/server/utils/db'
import _ from 'lodash'
import { WellContentWithSource } from '../api/well-contents.post'
import { inArray } from 'drizzle-orm'

export async function insertWellContentsAndSources(records: WellContentWithSource[]) {
    // split the records into wellContents and wellContentSources
    const newWellContentSources = _.flatMap(records, (x) => {
        return _.map(x.sourceWellIds || [], (sourceWellId) => {
            return {
                wellContentId: x.id,
                sourceWellId: sourceWellId,
                createdBy: x.createdBy || null,
            }
        }
    )})
    const newWellContents = _.map(records, (x) => _.omit(x, ['sourceWellIds', 'createdBy']))

    // wrap in single transaction to prevent partial submissions
    const transactionResult = await db.transaction(async (tx) => {
        await tx.insert(wellContents).values(newWellContents)
        if (!_.isEmpty(newWellContentSources)) {
            await tx.insert(wellContentSources).values(newWellContentSources)
        }
        return tx.select().from(wellContents).where(inArray(wellContents.id, _.map(newWellContents, 'id') as string[]))
    })

    return transactionResult
  }
