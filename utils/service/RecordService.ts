import _ from 'lodash'

export const RecordService = {
    async getRecord(baseUrl: string, id: string, withClause?: Object) {
        const fetchOptions = withClause ? {query: {with: withClause}} : undefined
        const record = await $fetch(`${baseUrl}/${id}`, fetchOptions)
        return record
    },

    async getRecords(baseUrl: string, withClause?: Object, where?: Object) {
        const fetchOptions = withClause ? {query: {with: withClause}} : {}
        if (where) {
            _.set(fetchOptions, ['query', 'where'], where)
        }
        const records = await $fetch(`${baseUrl}`, fetchOptions)
        return records
    },

    async getSchema(schemaBaseUrl: string, schemaName: string, recordId?: string) {
        const query = recordId ? `?id=${recordId}` : ''
        const schema = await $fetch(`${schemaBaseUrl}/${schemaName}${query}`)
        return schema
    },

    async updateRecord(baseUrl: string, record: any) {
        const {id, ...values} = record
        const updatedRecords = await $fetch(`${baseUrl}/${id}`, {method: 'PUT', body: values})
        return updatedRecords
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
