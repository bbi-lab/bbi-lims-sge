

import { geneGroups} from '~/server/db/schema/gene-group'
import jsonLogic, { JsonLogicFilter } from 'json-logic-js'

export async function selectGeneGroups(query:any) {
    const allGeneGroups = await db.select().from(geneGroups)
  
    // wrapping Json logic query with this so that it will be applied to every item in array
    // (e.g. query for filtering on property name=='test' would be {"==":[{"var":"name"},"test"]} )
    const queryFinal  = query ? {filter:[{var:""}, query]} : null
    
    // TODO - apply filter logic as where clause on query above
    return queryFinal ? jsonLogic.apply(queryFinal as JsonLogicFilter, allGeneGroups) || [] : allGeneGroups
}
