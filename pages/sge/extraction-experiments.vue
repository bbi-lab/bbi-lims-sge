<script setup lang="ts">
import _ from 'lodash'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import BeakerOutline from '~icons/mdi/beaker-outline'
import Molecule from '~icons/mdi/molecule'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref<string | null>(null)
const extractionExperimentsTable = ref()
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
    extractionExperimentsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event: any) {
    extractionExperimentsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event: any) {
    extractionExperimentsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}

const displayWithClause = Object.freeze({
    technician: {columns: {name: true}},
    extractionLotUsage: {columns: {},
        with: {
            lot:  {
                columns: {
                    lotNumber: true
                }
            },
        }
    },
    nucleicAcids: {columns: {id: true}},
})

const columnDefs: ColumnDefinitions = {
    extractedOn: {
        format: 'date-time'
    },
    technician: {
        path: 'technician.name'
    },
    nucleicAcids: {
        display: false,
    },
    extractionLotUsage: {
        header: 'Reagents',
        format: (x) => _.join(_.map(_.get(x, 'extractionLotUsage', []), (y) => {
            return  y.lot.lotNumber
        }), ', '),
        path: 'extractionLotUsage.displayValue',
        type: 'string',
    },
}

const rowActions = {
    nucleicAcids: {
        label: (data: any) => { return `${_.size(data.nucleicAcids)}`},
        action: (data: any) => {
            router.push({path:'/sge/nucleic-acids', query: {'extractionExperimentId': data.id}})
        },
        iconComponent: Molecule,
        iconPos: 'right',
        tooltip: 'Nucleic acids',
    },
    reagents: {
        label: (data: any) => { return `${data.extractionLotUsage?.length || 0}`},
        action: (data: any) => {
            router.push({path:`/sge/extraction-experiment/${data.id}/lot-usage`})
        },
        iconComponent: BeakerOutline,
        iconPos: 'right',
        tooltip: 'Reagents',
    },
    extraction: {
        label: () => 'Extraction',
        action: (data: any) => {
            router.push({path:`/sge/extraction-experiment/${data.id}/extraction`})
        },
        severity: 'warn',
        icon: 'pi pi-bolt',
        iconPos: 'right',
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="extractionExperimentsTable"
                tableName="extraction-experiments"
                schemaName="select"
                title="Extraction experiments"
                :rowActions="rowActions"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="extraction-experiments"
                schemaName="insert"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="editingRecordId && showEditForm"
                :recordId="editingRecordId"
                tableName="extraction-experiments"
                schemaName="update"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
