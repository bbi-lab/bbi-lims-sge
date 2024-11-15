<script setup>
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const cyclesTable = ref()
const router = useRouter()

const rowActions = {
    targets: {
        label: (data) => { return `${data.targets?.length || 0} Targets`},  // for this to work, we need to expand targets
        action: (data) => {
            router.push({path:'/sge/targets', query: {'cycleId': data.id}})
        }
    }
}

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
    cyclesTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    cyclesTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    cyclesTable.value.removeRecordId(event.id)
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
                ref="cyclesTable"
                tableName="cycles"
                schemaName="select"
                title="SGE Cycles"
                :rowActions="rowActions"
                :withClause="{targets: true}"
                :columnDefs="{startedOn: {format: 'date-time'}, endedOn: {format: 'date-time'}}"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
                @clickedRecordDelete="didClickRecordDelete"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="cycles"
                schemaName="insert"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="cycles"
                schemaName="update"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
