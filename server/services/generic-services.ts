
import _ from 'lodash'
import {SelectParams} from '../utils/restApi'
import { applySelectParamsToRecords } from '~/server/utils/restApi'
import { RelationalQueryBuilder } from 'drizzle-orm/pg-core/query-builders/query'
import { PgTableWithColumns } from 'drizzle-orm/pg-core'
import { eq } from 'drizzle-orm'

export async function selectRecords(queryBuilder: RelationalQueryBuilder<any, any>, selectParams: SelectParams) {
    const result = await queryBuilder.findMany({
        columns: selectParams.columns
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

export async function insertRecord(table: PgTableWithColumns<any>, values: any) {
    const [newRecord] = await db
      .insert(table)
      .values(values)
      .returning()
  
    return newRecord
  }
  
export async function updateRecord(table: PgTableWithColumns<any>, id: any, values: any) {
    const [updatedRecord] = await db
        .update(table)
        .set(values)
        .where(eq(table.id, id))
        .returning()

    return updatedRecord
}
