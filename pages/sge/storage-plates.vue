<script setup>
import _, { size } from 'lodash'

const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingMultipleRecordsIds = ref([])
const editingRecordId = ref(null)
const storagePlatesTable = ref()
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
        if (e.id) storagePlatesTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
function didAddRecord(event) {
    storagePlatesTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    storagePlatesTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    storagePlatesTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs = {
    plateType: {
        display: false
    },
    pcrExperimentId: {
        display: false
    },
    sizeX: {
        display: false
    },
    sizeY: {
        display: false
    },
    wells: {
        display: false
    },
}
const rowActions = {
    layout: {
        action: (data) => {
            router.push({path:`/sge/amp-plate-diagram/${data.id}`})
        },
    }
}
const defaultValues = {plateType: 'storage', sizeX: 12, sizeY: 8}

const fieldDefs = {
    pcrExperimentId: {
        display: false,
    },
    wells: {
        display: false,
    }
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="storagePlatesTable"
                tableName="plates"
                schemaName="select"
                title="Storage plates"
                :canEditMultiple="true"
                :selectionDisabled="showAddForm || showEditForm || showMultipleEditForm"
                :columnDefs="columnDefs"
                :where="{'==': [{var: 'plateType'}, 'storage'] }"
                :rowActions="rowActions"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedMultipleRecordEdit="didClickMultipleRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm || showMultipleEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="plates"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :defaultValues="defaultValues"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="plates"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :defaultValues="defaultValues"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="plates"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :defaultValues="defaultValues"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
