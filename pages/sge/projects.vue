
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'

const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingRecordId = ref<string | null>(null)
const editingMultipleRecordsIds = ref<string[]>([])
const projectsTable = ref()
const router = useRouter()

function didClickRecordEdit(event: any) {
    editingRecordId.value = event.id
    showEditForm.value = true
    showAddForm.value = false
}
function didClickMultipleRecordEdit(recordIds: string[]) {
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
function didAddRecord(event: any) {
    projectsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event: any) {
    projectsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didUpdateMultipleRecords(event: any) {
    event.forEach(e => {
        if (e.id) projectsTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
function didDeleteRecord(event: any) {
    projectsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs: ColumnDefinitions = {
    startedOn: {
        format: 'date-time'
    },
    targets: {
        display: false,
    }
}
const rowActions = {
    targets: {
        label: (data: any) => { return `${data.targets?.length || 0}`},
        action: (data: any) => {
            router.push({path:'/sge/targets', query: {'projectId': data.id}})
        },
        icon: 'pi pi-fw pi-bullseye',
        iconPos: 'right',
        tooltip: 'Targets',
    }
}
const fieldDefs: FieldDefinitions = {
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
                v-if="editingRecordId && showEditForm"
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
