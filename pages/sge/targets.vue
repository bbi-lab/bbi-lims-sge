
<script setup>
import { RecordService } from '@/utils/service/RecordService'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const targetsTable = ref()
const router = useRouter()
const route = useRoute()
const queryParams = route.query
const config = useRuntimeConfig()
const tableTitle = ref(null)

const rowActions = {
    regions: {
        label: (data) => { return `${data.regions?.length || 0} regions`},  // for this to work, we need to expand regions
        action: (data) => {
            router.push({path:'/sge/regions', query: {'targetId': data.id}})
        }
    }
}

onMounted(async() => {
    if (queryParams.projectId) {
        const project = await RecordService.getRecord(`${config.public.apiBase}/projects`, queryParams.projectId)
        tableTitle.value = `${project.name}: targets`
    } else {
        tableTitle.value = `All Targets`
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
    pcrExperimentsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    pcrExperimentsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    pcrExperimentsTable.value.removeRecordId(event.id)
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
                ref="targetsTable"
                tableName="targets"
                schemaName="select-target-schema"
                :title="tableTitle"
                :rowActions="rowActions"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
                @clickedRecordDelete="didClickRecordDelete"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="targets"
                schemaName="insert-target-schema"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="targets"
                schemaName="update-target-schema"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
