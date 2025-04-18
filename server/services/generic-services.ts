
import _ from 'lodash'
import {SelectParams} from '../utils/restApi'
import { applySelectParamsToRecords } from '~/server/utils/restApi'
import { RelationalQueryBuilder } from 'drizzle-orm/pg-core/query-builders/query'
import { PgViewWithSelection, type PgTable } from 'drizzle-orm/pg-core'
import { eq, inArray, getTableName, sql } from 'drizzle-orm'
import '../db/schema/sge/relations'
import { useDrizzle } from '../utils/db'
import { ENUM_LOOKUPS } from '../db/schema/sge/enum-lookups'

interface RecordValues {[key: string]: string | number | boolean | null | undefined }

const db = useDrizzle()

function expandEnumValues(records: any, tableName: string): void {
    if (!ENUM_LOOKUPS[tableName]) return

    const enumLookup = ENUM_LOOKUPS[tableName]
    if (_.isArray(records)) {
        _.forEach(records, (record) => {
            _.forEach(record, (value, key) => {
                if (_.isString(value) && enumLookup[key] && enumLookup[key][value]) {
                    record[key] = {value: record[key], ...enumLookup[key][value]}
                }
            })
        })
    } else {
        _.forEach(records, (value, key) => {
            if (_.isString(value) && enumLookup[key] && enumLookup[key][value]) {
                records[key] = {value: records[key], ...enumLookup[key][value]}
            }
        })
    }
}

function trimObjectValues(records: RecordValues[]): RecordValues[] {
    return _.map(records, (x) => {
        return _.mapValues(x, (value) => {
            return _.isString(value) ? _.trim(value) : value
        })
    })
}

export async function selectRecords(queryBuilder: RelationalQueryBuilder<any, any>, selectParams: SelectParams, expandEnums: boolean = false, viewName?: string) {
    let records
    if (viewName) {
        // if viewName is provided, ignore selectParams and query the view directly
        const result = await db.execute(sql.raw(`select * from ${viewName}`))
        // convert keys in records from raw sql query back to camelCase, to match format of records from queryBuilder
        records = _.map(result.rows, (x) => _.mapKeys(x, (value, key) => _.camelCase(key)))
    } else {
        records = await queryBuilder.findMany({
            columns: selectParams.columns,
            with: selectParams.with
        })
    }
    const result = applySelectParamsToRecords(selectParams, records)
    if (expandEnums) expandEnumValues(result, _.get(queryBuilder, 'tableConfig.dbName', ''))
    return result
}

export async function selectRecordsFromView(view: PgViewWithSelection, selectParams: SelectParams) {
    const records = await db.select().from(view)
    const result = applySelectParamsToRecords(selectParams, records)
    return result
}

export async function selectRecordFromView(view: PgViewWithSelection, id: string | number) {
    if (!view.id) {
        throw createError({
            statusCode: 400,
            statusMessage: `View does not have an id column`
        })
    }
    const record = await db.select().from(view).where(eq(view.id, id))
    return _.first(record)
}

export async function selectRecord(queryBuilder: RelationalQueryBuilder<any, any>, table: PgTable<any>, id: string | number, withClause: any, columns: any, expandEnums: boolean = false, viewName?: string) {
    let record
    if (viewName) {
        // if viewName is provided, ignore selectParams and query the view directly
        const result = await db.execute(sql.raw(`select * from ${viewName} where id = '${id}' limit 1`))
        // convert keys in records from raw sql query back to camelCase, to match format of records from queryBuilder
        record = _.mapKeys(result.rows[0], (value, key) => _.camelCase(key))
    } else {
        record = await queryBuilder.findFirst({
            where: () => eq(table.id, id),
            with: withClause,
            columns
        })
    }
    if (expandEnums) expandEnumValues(record, getTableName(table))
    return record
}

export async function insertRecord(table: PgTable<any>, values: RecordValues) {
    const [newRecord] = await db
      .insert(table)
      .values(trimObjectValues([values])[0])
      .returning()

    return newRecord
}

export async function insertRecords(table: PgTable<any>, records: Array<RecordValues>) {
    const newRecords = await db
      .insert(table)
      .values(trimObjectValues(records))
      .returning()

    return newRecords
  }
export async function updateRecord(table: PgTable<any>, id: string | number, values: RecordValues) {
    const [updatedRecord] = await db
        .update(table)
        .set(trimObjectValues([values])[0])
        .where(eq(table.id, id))
        .returning()

    return updatedRecord
}

export async function updateRecords(table: PgTable<any>, ids: string[] | number[], values: RecordValues) {
    const updatedRecords = await db
        .update(table)
        .set(trimObjectValues([values])[0])
        .where(inArray(table.id, ids))
        .returning()

    return updatedRecords
}

export async function deleteRecord(table: PgTable<any>, id: string | number) {
    const [deletedRecord] = await db
        .delete(table)
        .where(eq(table.id, id))
        .returning()

    return deletedRecord
}
