<script setup>
import _ from 'lodash'

const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingMultipleRecordsIds = ref([])
const editingRecordId = ref(null)
const platesTable = ref()
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
        if (e.id) platesTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
function didAddRecord(event) {
    platesTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    platesTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    platesTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs = {
    plateType: {
        format: ({plateType}) => plateType?.label || plateType || '',
        path: 'plateType.displayValue',
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
    emptyWells: {
        format: (data) => {
            // TODO: move this to a SQL view to avoid inefficient calc and needing to load all wells
            if (_.size(data.wells) == data.sizeX * data.sizeY) {
                return _.sumBy(data.wells, (well) => _.isEmpty(_.compact([well.amplificationPrimerId, well.linearizationPrimerId, well.homologyArmPrimerId])) ? 1 : 0)
            } else {
                return '-'
            }
        },
        path: 'emptyWells.displayValue',
    }
}
const rowActions = {
    layout: {
        action: (data) => {
            if (data.plateType?.value == 'amp-storage') {
                router.push({path:`/sge/amp-plate-diagram/${data.id}`})
            } else {
                router.push({path:`/sge/plate-diagram/${data.id}`})
            }
        },
    }
}
const defaultValues = {sizeX: 12, sizeY: 8}

const displayWithClause = {
    wells: {
        columns: {
            amplificationPrimerId: true,
            linearizationPrimerId: true,
            homologyArmPrimerId: true,
        },

    }
}
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
                ref="platesTable"
                tableName="plates"
                schemaName="select"
                title="Plates"
                :selectionDisabled="showAddForm || showEditForm || showMultipleEditForm"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                :expandEnums="true"
                :withClause="displayWithClause"
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
            <!-- <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="plates"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :defaultValues="defaultValues"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            /> -->
        </SplitterPanel>
    </Splitter>
</template>
