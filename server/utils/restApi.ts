import { JsonLogicAll } from "json-logic-js"
import _ from 'lodash'

export interface QueryParams {
    where: string,
    columns: string,
    order: string,
    limit: number,
    offset: number,
}

export interface SelectParams {
    where: JsonLogicAll,
    columns: { [key: string]: boolean },
    order: { [key: string]: 'asc' | 'desc' }
    limit: number,
    offset: number
}

export function queryToSelectParams<SelectParams>(queryParams: QueryParams) {
    const columnsToInclude = queryParams.columns ? _.reduce(JSON.parse(queryParams.columns), (obj:any,key:string) => {
        obj[key] = true
        return obj
    }, {}) : null

    const selectParams = {
        where: queryParams.where ? JSON.parse(queryParams.where) : null,
        columns: columnsToInclude,
        order: queryParams.order ? JSON.parse(queryParams.order) : null,
        limit: queryParams.limit,
        offset: queryParams.offset
    } as SelectParams

    return selectParams
}
