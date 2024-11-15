<script setup>
import _ from 'lodash';
import { userGroupMemberships } from '~/server/db/schema/user';

const config = useRuntimeConfig()

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const usersTable = ref()

const editWithClause = Object.freeze({userGroupMemberships:true})
const displayWithClause = Object.freeze({userGroupMemberships:{columns: {}, with: {userGroup: {columns: {name: true}}}}})

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

const columnDefs = {
    name: {header: 'Name'},
    email: {header: 'Email'},
    isAdmin: {header: 'Admin'},
    isVerified: {header: 'Verified'},
    userGroupMemberships: {
        header: 'Groups',
        format: ({userGroupMemberships}) => { return _.map(userGroupMemberships, (x) => x.userGroup?.name).join(', ')}
    },

}
</script>
<template>
    <Splitter>
        <SplitterPanel :size="50">
            <QuickTable
                ref="usersTable"
                tableName="users"
                schemaName="select-user-schema"
                title="Users"
                :canAdd="false"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
                @clickedRecordDelete="didClickRecordDelete"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="users"
                schemaName="insert-user-schema"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :withClause="editWithClause"
                :recordId="editingRecordId"
                tableName="users"
                schemaName="admin-update-user-schema"
                :canDelete="true"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
    
    
</template>
