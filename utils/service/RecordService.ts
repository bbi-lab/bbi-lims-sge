import type { DBQueryConfig } from 'drizzle-orm'
import _ from 'lodash'

export const RecordService = {
    async getRecord(baseUrl: string, id: string, withClause: Object | undefined, expandEnums: boolean = false) {
        const fetchOptions = withClause ? {query: {with: withClause, expandEnums}} : {query: {expandEnums}}
        const record = await $fetch(`${baseUrl}/${id}`, fetchOptions)
        return record
    },

    async getRecordTyped<FetchType>(tableName: TableNames, id: string, withClause: DBQueryConfig["with"], columns: DBQueryConfig["columns"]) {
        const fetchOptions = {query: {with: withClause, columns }}
        const record = await useFetch<FetchType>(`/api/${tableName}/${id}`, fetchOptions)
        return record.data as FetchType
    },

    async getRecordsByIds(baseUrl: string, ids: string[], withClause?: Object): Promise<any[]> {
        const whereClause = {"in": [{"var": "id"}, ids]}
        const fetchOptions = withClause ? {query: {with: withClause, where: whereClause}} : { query: {where: whereClause}}
        const records = await $fetch(`${baseUrl}`, fetchOptions) as any[]
        return records
    },

    async getRecords(baseUrl: string, withClause?: Object, where?: Object, expandEnums: boolean = false, viewName?: string): Promise<any[]> {
        const fetchOptions = {query: {expandEnums}}
        if (withClause) _.set(fetchOptions, ['query', 'with'], withClause)
        if (where) _.set(fetchOptions, ['query', 'where'], where)
        if (viewName) _.set(fetchOptions, ['query', 'view'], viewName)
        const records =  await $fetch(`${baseUrl}`, fetchOptions) as any[]
        return records
    },

    async getSchema(schemaBaseUrl: string, schemaName: string, recordId?: string) {
        const query = recordId ? `?id=${recordId}` : ''
        const schema = await $fetch(`${schemaBaseUrl}/${schemaName}${query}`)
        return schema
    },

    async updateRecord(baseUrl: string, record: any, withClause?: Object) {
        const {id, ...values} = record
        const updatedRecords = await $fetch(`${baseUrl}/${id}`, {method: 'PUT', body: values})

        if (!_.isEmpty(withClause)) {
            const fetchOptions = {query: {with: withClause}}
            const record = await $fetch(`${baseUrl}/${id}`, fetchOptions)
            return record
        } else {
            return updatedRecords
        }
    },

    async updateRecords(baseUrl: string, ids: string[], values: Object, withClause?: Object) {
        const updatedRecords = await $fetch(baseUrl, {method: 'PUT', body: {ids, values}})
        if (!_.isEmpty(withClause) && !_.isEmpty(updatedRecords)) {
            const whereClause = {"in": [{"var": "id"}, ids]}
            const fetchOptions = {query: {with: withClause, where: whereClause}}
            const records = await $fetch(baseUrl, fetchOptions)
            return records
        } else {
            return updatedRecords
        }
    },

    async addRecord(baseUrl: string, record: any) {
        const {id, ...values} = record
        const newRecords = await $fetch(`${baseUrl}`, {method: 'POST', body: [values]})
        return _.get(newRecords, 0)
    },

    async addRecords(baseUrl: string, records: any) {
        const recordsCopy = _.map(records, (x) => _.omit(x, 'id'))
        const newRecords = await $fetch(`${baseUrl}`, {method: 'POST', body: recordsCopy})
        return newRecords
    },

    async deleteRecord(baseUrl: string, id: string) {
        const deletedRecord = await $fetch(`${baseUrl}/${id}`, {method: 'DELETE'})
        return deletedRecord
    },

    async deleteRecords(baseUrl: string, records: any) {
        const deletedRecords = []
        for (const {id} of records) {
            const data = await $fetch(`${baseUrl}/${id}`,  {method: 'DELETE'})
            deletedRecords.push(data)
        }
        return deletedRecords
    },
}
