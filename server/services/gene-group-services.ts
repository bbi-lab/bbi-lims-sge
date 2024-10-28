import jsonLogic, { JsonLogicFilter } from 'json-logic-js'
import _ from 'lodash'
import {SelectParams} from '../utils/restApi'

export async function selectGeneGroups(selectParams: SelectParams) {
    const allGeneGroups = await db.query.geneGroups.findMany({
        columns: selectParams.columns
    })

    // wrapping Json logic query with this so that it will be applied to every item in array
    // (e.g. query for filtering on property name=='test' would be {"==":[{"var":"name"},"test"]} )
    const queryFinal  = selectParams.where ? {filter:[{var:""}, selectParams.where]} : null
    
    // TODO - apply filter logic as where clause on query above
    let result = queryFinal ? jsonLogic.apply(queryFinal as JsonLogicFilter, allGeneGroups) || [] : allGeneGroups

    if (selectParams.order) {
        result = _.orderBy(result, Object.keys(selectParams.order), Object.values(selectParams.order))
    }
    if (selectParams.offset) {
        result = _.slice(result, selectParams.offset)
    }
    if (selectParams.limit) {
        result = _.take(result, selectParams.limit)
    }
    return result
}
