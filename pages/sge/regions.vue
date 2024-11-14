<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const regionsTable = ref()
const route = useRoute()
const queryParams = route.query
const config = useRuntimeConfig()
const tableTitle = ref(null)

onMounted(async() => {
    if (queryParams.targetId) {
        const target = await RecordService.getRecord(`${config.public.apiBase}/targets`, queryParams.targetId)
        tableTitle.value = `${target.name}: regions`
    } else {
        tableTitle.value = `All Regions`
    }
})

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
    regionsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    regionsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    regionsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
function didClickRecordDelete(event) {
    console.log(event)
}

// convert query params in to JSON Logic to pass as where clause
// TODO - pass more than just the first to QuickTable
const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})
const defaultValues = queryParams

</script>
<template>
    <Splitter>
        <SplitterPanel :size="50">
            <QuickTable
                ref="regionsTable"
                tableName="regions"
                schemaName="select"
                :title="tableTitle"
                :where="whereClauses[0]"
                :withClause="displayWithClause"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
                @clickedRecordDelete="didClickRecordDelete"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="regions"
                schemaName="insert"
                :defaultValues="defaultValues"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="regions"
                schemaName="update"
                :defaultValues="defaultValues"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
