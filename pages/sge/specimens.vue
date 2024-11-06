
<script setup>
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const specimensTable = ref()

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
    specimensTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    specimensTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    specimensTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
function didClickRecordDelete(event) {
    console.log(event)
}
</script>
<template>
    <Splitter>
        <SplitterPanel :size="50">
            <QuickTable
                ref="specimensTable"
                tableName="specimens"
                schemaName="select-specimen-schema"
                title="Specimens"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
                @clickedRecordDelete="didClickRecordDelete"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="specimens"
                schemaName="insert-specimen-schema"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="specimens"
                schemaName="update-specimen-schema"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
    
    
</template>
