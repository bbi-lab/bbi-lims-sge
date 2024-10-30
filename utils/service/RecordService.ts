export const RecordService = {
    async getRecord(baseUrl: string, id: string) {
        const record = await $fetch(`${baseUrl}/${id}`)
        return record
    },

    async getRecords(baseUrl: string) {
        const records = await $fetch(`${baseUrl}`)
        return records
    },

    async getSchema(baseUrl: string, schemaName: string, recordId?: string) {
        const query = recordId ? `?id=${recordId}` : ''
        const schema = await $fetch(`${baseUrl}/schema/${schemaName}${query}`)
        return schema
    },

    async updateRecord(baseUrl: string, record: any) {
        const {id, ...values} = record
        const updatedRecords = await $fetch(`${baseUrl}/${id}`, {method: 'PUT', body: values})
        return updatedRecords
    },

    async addRecord(baseUrl: string, record: any) {
        const {id, ...values} = record
        const newRecord = await $fetch(`${baseUrl}`, {method: 'POST', body: values})
        return newRecord
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
