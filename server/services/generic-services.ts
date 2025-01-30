
import _ from 'lodash'
import {SelectParams} from '../utils/restApi'
import { applySelectParamsToRecords } from '~/server/utils/restApi'
import { RelationalQueryBuilder } from 'drizzle-orm/pg-core/query-builders/query'
import { type PgTableWithColumns } from 'drizzle-orm/pg-core'
import { eq } from 'drizzle-orm'
import '../db/schema/sge/relations'

interface RecordValues {[key: string]: string | number | boolean | null | undefined }

function trimObjectValues(records: RecordValues[]): RecordValues[] {
    return _.map(records, (x) => {
        return _.mapValues(x, (value) => {
            return _.isString(value) ? _.trim(value) : value
        })
    })
}

export async function selectRecords(queryBuilder: RelationalQueryBuilder<any, any>, selectParams: SelectParams) {
    const result = await queryBuilder.findMany({
        columns: selectParams.columns,
        with: selectParams.with
    })
    return applySelectParamsToRecords(selectParams, result)
}

export async function selectRecord(queryBuilder: RelationalQueryBuilder<any, any>, table: PgTableWithColumns<any>, id: any, withClause?: any, columns?: any) {
    const result = await queryBuilder.findFirst({
        where: () => eq(table.id, id),
        with: withClause,
        columns
    }) 
    return result
}

export async function insertRecord(table: PgTableWithColumns<any>, values: RecordValues) {
    const [newRecord] = await db
      .insert(table)
      .values(trimObjectValues([values])[0])
      .returning()
  
    return newRecord
}

export async function insertRecords(table: PgTableWithColumns<any>, records: Array<RecordValues>) {
    const newRecords = await db
      .insert(table)
      .values(trimObjectValues(records))
      .returning()
  
    return newRecords
  }
export async function updateRecord(table: PgTableWithColumns<any>, id: any, values: RecordValues) {
    const [updatedRecord] = await db
        .update(table)
        .set(trimObjectValues([values])[0])
        .where(eq(table.id, id))
        .returning()

    return updatedRecord
}

export async function deleteRecord(table: PgTableWithColumns<any>, id: string | number) {
    const [deletedRecord] = await db
        .delete(table)
        .where(eq(table.id, id))
        .returning({ id: table.id })

    return deletedRecord
}
