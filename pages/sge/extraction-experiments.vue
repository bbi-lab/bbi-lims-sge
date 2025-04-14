<script setup>
import _ from 'lodash'
import DotsTriangle from '~icons/mdi/dots-triangle'
import BeakerOutline from '~icons/mdi/beaker-outline'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const extractionExperimentsTable = ref()
const router = useRouter()

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
    extractionExperimentsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    extractionExperimentsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
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
    pellets: {columns: {id: true}},
})

const columnDefs = {
    extractedOn: {
        format: 'date-time'
    },
    technician: {
        path: 'technician.name'
    },
    pellets: {
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
    pellets: {
        label: (data) => { return `${_.size(data.pellets)}`},
        action: (data) => {
            router.push({path:'/sge/pellets', query: {'extractionExperimentId': data.id}})
        },
        iconComponent: DotsTriangle,
        iconPos: 'right',
        tooltip: 'Pellets',
    },
    reagents: {
        label: (data) => { return `${data.extractionLotUsage?.length || 0}`},
        action: (data) => {
            router.push({path:`/sge/extraction-experiment/${data.id}/lot-usage`})
        },
        iconComponent: BeakerOutline,
        iconPos: 'right',
        tooltip: 'Reagents',
    },
    extraction: {
        label: () => 'Extraction',
        action: (data) => {
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
                v-if="showEditForm"
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
