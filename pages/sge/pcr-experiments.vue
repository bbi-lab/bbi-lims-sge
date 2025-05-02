
<script setup lang="ts">
import _ from 'lodash'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import PhGridNineFill from '~icons/ph/grid-nine-fill'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref<string | null>(null)
const pcrExperimentsTable = ref()
const router = useRouter()

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
    pcrExperimentsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event: any) {
    pcrExperimentsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event: any) {
    pcrExperimentsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}

const columnDefs: ColumnDefinitions = {
    startedOn: {
        format: 'date-time'
    },
    plates: {
        display: false,
    },
    technician: {
        path: 'technician.name',
    }
}
const rowActions = {
    plates: {
        label: (data: any) => { return `${data.plates?.length || 0}`},  // for this to work, we need to expand plates
        action: (data: any) => {
            router.push({path:'/sge/plates', query: {'pcrExperimentId': data.id}})
        },
        iconComponent: PhGridNineFill,
        iconPos: 'right',
        tooltip: 'Plates',
    }
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="pcrExperimentsTable"
                tableName="pcr-experiments"
                schemaName="select"
                title="PCR Experiments"
                :rowActions="rowActions"
                :withClause="{plates: true, technician: {columns: {name: true}}}"
                :columnDefs="columnDefs"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="pcr-experiments"
                schemaName="insert"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="editingRecordId && showEditForm"
                :recordId="editingRecordId"
                tableName="pcr-experiments"
                schemaName="update"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
