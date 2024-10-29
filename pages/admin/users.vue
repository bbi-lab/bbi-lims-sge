<script setup>
const config = useRuntimeConfig()

const baseUrl = `${config.public.apiBase}/users`

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const usersTable = ref()

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
    usersTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    usersTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    usersTable.value.removeRecordId(event.id)
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
                ref="usersTable"
                :apiBaseUrl="baseUrl" 
                schemaName="select-user-schema"
                title="Users"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
                @clickedRecordDelete="didClickRecordDelete"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                :apiBaseUrl="baseUrl" 
                schemaName="insert-user-schema"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :apiBaseUrl="baseUrl" 
                :recordId="editingRecordId"
                schemaName="admin-update-user-schema"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
    
    
</template>
