import { type JsonLogicAll } from "json-logic-js"
import _ from 'lodash'
import jsonLogic, { type JsonLogicFilter } from 'json-logic-js'
import { eq } from "drizzle-orm"
import { wellContents } from "../db/schema/sge/well"

export interface QueryParams {
    where: string,
    columns: string,
    order: string,
    limit: number,
    offset: number,
    with: string,
    expandEnums: string,
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
    // if columns is array, convert to object with boolean property set to true for each entry
    const columnsToInclude = queryParams.columns ? (_.isArray(JSON.parse(queryParams.columns)) ? _.reduce(JSON.parse(queryParams.columns), (obj:any,key:string) => {
        obj[key] = true
        return obj
    }, {}) : JSON.parse(queryParams.columns)) : undefined

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
    jsonLogic.add_operation("toLower", (a) => _.toLower(a))

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

export function parsePutPostError(error: any, recordType: string) {
    let data

    // convert duplicate value error message to more useful data object
    const regex = /^duplicate key value violates unique constraint "([^"]*)"/
    const match = error.message?.match(regex)
    if (match) {
        const tableName = _.snakeCase(recordType)
        let fieldName
        // check that constraint name conforms to default `${tableName}_${fieldName}_unique` (snakecase)
        if (match[1].startsWith(`${tableName}_`) && match[1].endsWith('_unique')) {
            fieldName = _.camelCase(match[1].slice(tableName.length + 1, -7))
        }
        // TODO confirm that field name is valid for given recordType before setting data value
        data = fieldName ? [{
            code: 'duplicate_key_value',
            path: [fieldName],
            message: 'Must be unique',
        }] : undefined
    }

    if (!data) {
        try {
            data = JSON.parse(error.message)
        } catch (err) {
            data = {}
        }
    }

    return {error, data}
}

export async function parseDeleteError(error: any, recordId: string) {
    // convert delete error due to constraint to more user-friendly error message
    const regex = /^update or delete on table "([^"]*)" violates foreign key constraint "([^"]*)" on table "([^"]*)"/
    const match = error.message?.match(regex)

    if (match && match.length === 4) {
        const relatedTable = match[3]

        if (relatedTable == 'well_contents') {
            const fieldName = `${_.camelCase(_.trimEnd(match[1], 's'))}Id`
            if (wellContents[fieldName]) {
                const relatedWellContents = await db.query.wellContents.findMany({
                    with: {
                        well: {
                            with: {
                                plate: {
                                    columns: {
                                        name: true,
                                    }
                                }
                            },
                        },
                    },
                    where: eq(wellContents[fieldName], recordId),
                })
                const plateNames = _.uniq(_.map(relatedWellContents, 'well.plate.name'))
                error.message = `Cannot delete due to presence in plate(s)/storage box(es): ${_.join(plateNames, ',')}.`
            }
        } else {
            error.message = `Cannot delete due to related records in ${_.startCase(relatedTable)} table.`
        }
    }
}
