<script setup lang="ts">
import _ from 'lodash'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref<string | null>(null)
const reagentsTable = ref()

const rowActions = {}

function didClickRecordEdit(event: any) {
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

function didAddRecord(event: any) {
    reagentsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event: any) {
    reagentsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event: any) {
    reagentsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}

const columnDefs: ColumnDefinitions = {
    name: {
        index: 0,
    },
    concentrationUnit: {
        format: ({soluteUnit, volumeUnit}: {soluteUnit: string, volumeUnit: string}) => { return soluteUnit && volumeUnit ? `${soluteUnit}/${volumeUnit}` : ''},
        path: 'concentrationUnit.displayValue',
        type: 'string',
        index: 1,
    },
    soluteUnit: {
        display: false,
    },
    volumeUnit: {
        display: false,
    }
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="reagentsTable"
                tableName="reagents"
                schemaName="select"
                title="Reagents"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="reagents"
                schemaName="insert"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="editingRecordId && showEditForm"
                :recordId="editingRecordId"
                tableName="reagents"
                schemaName="update"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
