import { JsonLogicAll } from "json-logic-js"
import _ from 'lodash'

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
