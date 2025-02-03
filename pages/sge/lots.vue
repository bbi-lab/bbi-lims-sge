<script setup>
import _ from 'lodash'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const lotsTable = ref()
const config = useRuntimeConfig()

const rowActions = {}

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
    reagent: {
        format: (x) => _.get(x, 'reagent.name'),
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
            displayFormat: (x) => { return `${x.name} (${x.soluteUnit}/${x.volumeUnit})` },
        }
    }
}
</script>
<template>
    <Splitter>
        <SplitterPanel :size="50">
            <QuickTable
                ref="lotsTable"
                tableName="lots"
                schemaName="select"
                title="Lots"
                :rowActions="rowActions"
                :columnDefs="columnDefs"
                :withClause="{reagent: true}"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="lots"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="lots"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
