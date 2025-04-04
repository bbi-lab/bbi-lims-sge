<script setup>
const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingRecordId = ref(null)
const editingMultipleRecordsIds = ref([])
const cyclesTable = ref()
const router = useRouter()

function didClickRecordEdit(event) {
    editingRecordId.value = event.id
    showEditForm.value = true
    showAddForm.value = false
}

function didClickRecordAdd() {
    showAddForm.value = true
    showEditForm.value = false
}
function didClickCancelAddForm() {
    showAddForm.value = false
}
function didClickCancelEditForm() {
    editingRecordId.value = null
    showEditForm.value = false
}
function didClickMultipleRecordEdit(recordIds) {
    editingMultipleRecordsIds.value = recordIds
    showMultipleEditForm.value = true
    showEditForm.value = false
    showAddForm.value = false
}
function didClickCancelMultipleEditForm() {
    editingMultipleRecordsIds.value = []
    showMultipleEditForm.value = false
}
function didUpdateMultipleRecords(event) {
    event.forEach(e => {
        if (e.id) cyclesTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
function didAddRecord(event) {
    cyclesTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    cyclesTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    cyclesTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs = {
    startedOn: {
        format: 'date-time'
    },
    endedOn: {
        format: 'date-time'
    },
    targets: {
        display: false,
    }
}
const rowActions = {
    targets: {
        label: (data) => { return `${data.targets?.length || 0}`},
        action: (data) => {
            router.push({path:'/sge/targets', query: {'cycleId': data.id}})
        },
        icon: 'pi pi-fw pi-bullseye',
        iconPos: 'right',
        tooltip: 'Targets',
    }
}
const fieldDefs = {
    targets: {
        display: false,
    }
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="cyclesTable"
                tableName="cycles"
                schemaName="select"
                title="SGE Cycles"
                :rowActions="rowActions"
                :withClause="{targets: true}"
                :columnDefs="columnDefs"
                :canEditMultiple="true"
                :selectionDisabled="showAddForm || showEditForm || showMultipleEditForm"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedMultipleRecordEdit="didClickMultipleRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm || showMultipleEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="cycles"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="cycles"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="cycles"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
