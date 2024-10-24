
<script setup>
const config = useRuntimeConfig()

const baseUrl = `${config.public.apiBase}/specimens`

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const specimensTable = ref()

function didClickRecordEdit(event) {
    editingRecordId.value = event.id
    showEditForm.value = true
}

function didClickRecordAdd() {
    showAddForm.value = true
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
        <SplitterPanel>
            <QuickTable
                ref="specimensTable"
                :apiBaseUrl="baseUrl" 
                schemaName="select"
                title="Specimens"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
                @clickedRecordDelete="didClickRecordDelete"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                :apiBaseUrl="baseUrl" 
                schemaName="insert"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :apiBaseUrl="baseUrl" 
                :recordId="editingRecordId"
                schemaName="update"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
    
    
</template>
