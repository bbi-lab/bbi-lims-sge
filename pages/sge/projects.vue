
<script setup>
const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingRecordId = ref(null)
const editingMultipleRecordsIds = ref([])
const projectsTable = ref()
const router = useRouter()

function didClickRecordEdit(event) {
    editingRecordId.value = event.id
    showEditForm.value = true
    showAddForm.value = false
}
function didClickMultipleRecordEdit(recordIds) {
    editingMultipleRecordsIds.value = recordIds
    showMultipleEditForm.value = true
    showEditForm.value = false
    showAddForm.value = false
}
function didClickRecordAdd() {
    showAddForm.value = true
    showEditForm.value = false
    showMultipleEditForm.value = false
}
function didClickCancelAddForm() {
    showAddForm.value = false
}
function didClickCancelEditForm() {
    editingRecordId.value = null
    showEditForm.value = false
}
function didClickCancelMultipleEditForm() {
    editingMultipleRecordsIds.value = []
    showMultipleEditForm.value = false
}
function didAddRecord(event) {
    projectsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    projectsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didUpdateMultipleRecords(event) {
    event.forEach(e => {
        if (e.id) projectsTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
function didDeleteRecord(event) {
    projectsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs = {
    startedOn: {
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
            router.push({path:'/sge/targets', query: {'projectId': data.id}})
        },
        icon: 'pi pi-fw pi-bullseye',
        iconPos: 'right',
        tooltip: 'Targets',
    }
}
const fieldDefs = {
    targets: {
        display: false,
    },
    startedOn: {
        type: 'date',
    }
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="projectsTable"
                tableName="projects"
                schemaName="select"
                title="SGE Projects"
                :rowActions="rowActions"
                :columnDefs="columnDefs"
                :withClause="{targets: true}"
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
                tableName="projects"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="projects"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="projects"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
