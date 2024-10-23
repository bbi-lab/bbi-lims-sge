export const RecordService = {
    async getRecord(baseUrl, id) {
        const record = await $fetch(`${baseUrl}/${id}`)
        return record
    },

    async getRecords(baseUrl) {
        const records = await $fetch(`${baseUrl}`)
        return records
    },

    async getSchema(baseUrl, schemaName) {
        const schema = await $fetch(`${baseUrl}/schema/${schemaName}`)
        return schema
    },

    async updateRecord(baseUrl, record) {
        const {id, ...values} = record
        const updatedRecords = await $fetch(`${baseUrl}/${id}`, {method: 'PUT', body: values})
        return updatedRecords
    },

    async addRecord(baseUrl, record) {
        const {id, ...values} = record
        const newRecord = await $fetch(`${baseUrl}`, {method: 'POST', body: values})
        return newRecord
    },

    async deleteRecord(baseUrl, id) {
        const deletedRecord = await $fetch(`${baseUrl}/${id}`, {method: 'DELETE'})
        return deletedRecord
    },

    async deleteRecords(baseUrl, records) {
        const deletedRecords = []
        for (const {id} of records) {
            const data = await $fetch(`${baseUrl}/${id}`,  {method: 'DELETE'})
            deletedRecords.push(data)
        }
        return deletedRecords
    },
}
