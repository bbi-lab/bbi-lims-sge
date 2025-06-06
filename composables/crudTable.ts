export const useCrudTable = () => {
    const state = reactive({
        editingRecordId: null as string | null,
        editingMultipleRecordsIds: [] as string[],
        showEditForm: false,
        showAddForm: false,
        showMultipleEditForm: false,
    })
    const tableRef = ref()

    const setTableRef = (el: any) => {
        tableRef.value = el
    }

    const didClickRecordEdit = (event: any) => {
        state.editingRecordId = event.id
        state.showEditForm = true
        state.showAddForm = false
    }

    const didClickRecordAdd = () => {
        state.showAddForm = true
        state.showEditForm = false
    }
    const didClickCancelAddForm = () => {
        state.showAddForm = false
    }
    const didClickCancelEditForm = () => {
        state.editingRecordId = null
        state.showEditForm = false
    }

    const didAddRecord = (event: any) => {
        tableRef.value.addOrRefreshRecordId(event.id)
        state.showAddForm = false
    }
    const didUpdateRecord = (event: any) => {
        tableRef.value.addOrRefreshRecordId(event.id)
        state.showEditForm = false
    }
    const didDeleteRecord = (event: any) => {
        tableRef.value.removeRecordId(event.id)
        state.showEditForm = false
    }
    const didClickMultipleRecordEdit = (recordIds: string[]) => {
        state.editingMultipleRecordsIds = recordIds
        state.showMultipleEditForm = true
        state.showEditForm = false
        state.showAddForm = false
    }
    const didClickCancelMultipleEditForm = () => {
        state.editingMultipleRecordsIds = []
        state.showMultipleEditForm = false
    }
    const didUpdateMultipleRecords = (event: any) => {
        event.forEach((e: any) => {
            if (e.id) tableRef.value.addOrRefreshRecordId(e.id)
        })
        state.showMultipleEditForm = false
    }

    return {
        state,
        tableRef,
        setTableRef,
        didClickRecordEdit,
        didClickRecordAdd,
        didClickCancelAddForm,
        didClickCancelEditForm,
        didAddRecord,
        didUpdateRecord,
        didDeleteRecord,
        didClickMultipleRecordEdit,
        didClickCancelMultipleEditForm,
        didUpdateMultipleRecords,
    }
}
