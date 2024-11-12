<script setup>
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const projectsTable = ref()

function didClickRecordEdit(event) {
    editingRecordId.value = event.id
    showEditForm.value = true
    showAddForm.value = false
}

// function didClickRecordAdd() {
//     showAddForm.value = true
//     showEditForm.value = false
// }
function didClickCancelAddForm() {
    showAddForm.value = false
}
function didClickCancelEditForm() {
    editingRecordId.value = null
    showEditForm.value = false
}

// function didAddRecord(event) {
//     projectsTable.value.addOrRefreshRecordId(event.id)
//     showAddForm.value = false
// }
function didUpdateRecord(event) {
    projectsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    projectsTable.value.removeRecordId(event.id)
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
                ref="genesTable"
                tableName="genes"
                schemaName="select-gene-schema"
                title="Genes"
                :canAdd="false"
                :canDelete="false"
                selectionMode="single"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
                @clickedRecordDelete="didClickRecordDelete"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="genes"
                :canDelete="false"
                schemaName="update-gene-schema"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
