
<script setup lang="ts">
import _ from 'lodash'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { ENUM_LOOKUPS } from '~/server/db/schema/sge/enum-lookups'
import { RecordService } from '~/utils/service/RecordService'
import PhGridNineFill from '~icons/ph/grid-nine-fill'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref<string | null>(null)
const pcrExperimentsTable = ref()
const router = useRouter()
const config = useRuntimeConfig()

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

async function didAddRecord(event: any) {
    // add corresponding plate
    await RecordService.addRecord(`${config.public.apiBase}/plates`, {
        name: event.name,
        sizeX: 12,
        sizeY: 8,
        plateType: event.pcrType,
        pcrExperimentId: event.id,
    })
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
    },
    pcrType: {
        display: false,
    },
    pcrTypeLabel: {
        header: 'Type',
        format: (x: any) => {
            return _.get(ENUM_LOOKUPS.pcrExperiments.pcrType, [x.pcrType, 'label'])
        },
        path: 'pcrType.displayValue',
    },
}
const rowActions = {
    plates: {
        label: (data: any) => { return `${data.plates?.length || 0}`},  // for this to work, we need to expand plates
        action: (data: any) => {
            router.push({path:`/sge/plate-diagram/${data.pcrType}/${data.plates[0].id}`})
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
                :withClause="{plates: {columns: {id: true}}, technician: {columns: {name: true}}}"
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
