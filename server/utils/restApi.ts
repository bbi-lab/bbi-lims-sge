import { JsonLogicAll } from "json-logic-js"
import _ from 'lodash'
import jsonLogic, { JsonLogicFilter } from 'json-logic-js'

export interface QueryParams {
    where: string,
    columns: string,
    order: string,
    limit: number,
    offset: number,
    with: string,
}

export interface SelectParams {
    where: JsonLogicAll,
    columns: { [key: string]: boolean },
    order: { [key: string]: 'asc' | 'desc' }
    limit: number,
    offset: number,
    with: any,
}

export function queryToSelectParams<SelectParams>(queryParams: QueryParams) {
    const columnsToInclude = queryParams.columns ? _.reduce(JSON.parse(queryParams.columns), (obj:any,key:string) => {
        obj[key] = true
        return obj
    }, {}) : null

    const selectParams = {
        where: queryParams.where ? JSON.parse(queryParams.where) : undefined,
        columns: columnsToInclude,
        order: queryParams.order ? JSON.parse(queryParams.order) : undefined,
        limit: queryParams.limit,
        offset: queryParams.offset,
        with: queryParams.with ? JSON.parse(queryParams.with) : undefined
    } as SelectParams

    return selectParams
}

export function applySelectParamsToRecords<T>(selectParams: SelectParams, records: T): T {
    // wrapping Json logic query with this so that it will be applied to every item in array
    // (e.g. query for filtering on property name=='test' would be {"==":[{"var":"name"},"test"]} )
    const queryFinal  = selectParams.where ? {filter:[{var:""}, selectParams.where]} : null
    
    jsonLogic.add_operation("startsWith", (a, b) => _.startsWith(_.toLower(a), _.toLower(b)))
    
    // TODO - apply filter logic as where clause on query above
    let result = queryFinal ? jsonLogic.apply(queryFinal as JsonLogicFilter, records) || [] : records

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
