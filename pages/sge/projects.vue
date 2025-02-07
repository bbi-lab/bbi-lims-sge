
<script setup>
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const projectsTable = ref()
const router = useRouter()

const rowActions = {
    targets: {
        label: (data) => { return `${data.targets?.length || 0} Targets`},  // for this to work, we need to expand targets
        action: (data) => {
            router.push({path:'/sge/targets', query: {'projectId': data.id}})
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
    projectsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    projectsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    projectsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs = {
    startedOn: {
        format: 'date-time'
    },
    targets: {
        display: false,
    }
}
const fieldDefs = {
    targets: {
        display: false,
    }
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="projectsTable"
                tableName="projects"
                schemaName="select"
                title="SGE Projects"
                :rowActions="rowActions"
                :columnDefs="columnDefs"
                :withClause="{targets: true}"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8 overflow-y-scroll" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="projects"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="projects"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
