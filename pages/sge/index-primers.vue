<script setup lang="ts">
import _ from 'lodash'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref<string | null>(null)
const indexPrimersTable = ref()

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
    indexPrimersTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event: any) {
    indexPrimersTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event: any) {
    indexPrimersTable.value.removeRecordId(event.id)
    showEditForm.value = false
}

const columnDefs = {}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="indexPrimersTable"
                tableName="index-primers"
                schemaName="select"
                title="Index Primers"
                :rowActions="rowActions"
                :columnDefs="columnDefs"
                :can-edit="false"
                :can-delete="false"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="index-primers"
                schemaName="insert"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
