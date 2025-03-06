<script setup>
import _ from 'lodash'

const config = useRuntimeConfig()

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const lotsTable = ref()
const showMultipleEditForm = ref(false)
const editingMultipleRecordsIds = ref([])

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

function didAddRecord(event) {
    lotsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    lotsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    lotsTable.value.removeRecordId(event.id)
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
        if (e.id) lotsTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
const columnDefs = {
    startedUseOn: {
        format: 'date-time'
    },
    endedUseOn: {
        format: 'date-time'
    },
    expiresOn: {
        format: 'date-time'
    },
    lotNumber: {
        index: 0,
    },
    reagent: {
        path: 'reagent.name',
        index: 1,
    },
    inHouse: {
        index: 2,
    },
    status: {
        index: 3,
    },
    concentration: {
        format: ({concentration, reagent}) => { return reagent.soluteUnit && reagent.volumeUnit ? `${concentration || '--'} ${reagent.soluteUnit}/${reagent.volumeUnit}` : ''},
        path: 'concentration.displayValue',
        type: 'string',
        index: 4,
    },
    startingVolume: {
        format: ({startingVolume, reagent}) => { return reagent.volumeUnit ? `${startingVolume || '--'} ${reagent.volumeUnit}` : ''},
        path: 'startingVolume.displayValue',
        type: 'string',
        index: 5,
    },
}

const fieldDefs = {
    reagent: {
        label: 'Reagent',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/reagents`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
        }
    },
    concentration: {
        label: (_data, relatedData) => {
            if (_.isObject(relatedData?.reagent)) {
                return `Concentration (${relatedData.reagent?.soluteUnit}/${relatedData.reagent?.volumeUnit})` 
            } else {
                return 'Concentration'
            }
        }
    },
    startingVolume: {
        label: (_data, relatedData) => {
            if (_.isObject(relatedData?.reagent)) {
                return `Starting Volume (${relatedData.reagent?.volumeUnit})` 
            } else {
                return 'Starting Volume'
            }
        }
    }
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="lotsTable"
                tableName="lots"
                schemaName="select"
                title="Lots"
                :columnDefs="columnDefs"
                :withClause="{reagent: true}"
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
                tableName="lots"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :withClause="{reagent: true}"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="lots"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="{reagent: true}"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="lots"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
