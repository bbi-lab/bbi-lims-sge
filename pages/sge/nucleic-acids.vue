
<script setup lang="ts">
import _ from 'lodash'


const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingMultipleRecordsIds = ref<string[]>([])
const editingRecordId = ref(null)
const nucleicAcidsTable = ref()

const route = useRoute()
const config = useRuntimeConfig()
const queryParams = route.query

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
function didClickMultipleRecordEdit(recordIds: string[]) {
    editingMultipleRecordsIds.value = recordIds
    showMultipleEditForm.value = true
    showEditForm.value = false
    showAddForm.value = false
}
function didClickCancelMultipleEditForm() {
    editingMultipleRecordsIds.value = []
    showMultipleEditForm.value = false
}
function didUpdateMultipleRecords(event: any) {
    event.forEach((e: any) => {
        if (e.id) nucleicAcidsTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
function didAddRecord(event: any) {
    nucleicAcidsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event: any) {
    nucleicAcidsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event: any) {
    nucleicAcidsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const displayWithClause = Object.freeze({
    extractionExperiment: {
        columns: {name: true}
    },
    // storageBox: {
    //     columns: {name: true}
    // },
    pellet: {
        columns: {id: true, name: true, isBackup: true},
    },
})
const columnDefs = {
    pellet: {
        index: 1,
        type: 'element',
        element: (x: any) => {
            const href = `/sge/pellets?id=${x.pellet.id}`
            return `<a href="${href}" class="text-blue-500 hover:underline">${x.pellet.name}</a>`
        },
        elementSearchText: (x: any) => {
            return x.pellet.name
        },
    },
    pelletIsBackup: {
        path: 'pelletIsBackup.displayValue',
        header: 'Backup pellet',
        type: 'bool',
        format: (data: any) => {
            return data.pellet?.isBackup ? '✓' : ''
        },

        index: 2,
    },
    extractionExperiment: {
        path: 'extractionExperiment.name',
        index: 3,
    },
    // storageBox: {
    //     path: 'storageBox.name',
    //     index: 3,
    // },
    // storageBoxLoc: {
    //     index: 4,
    // },
    protocol: {
        index: 4,
    },
    extractionExperimentId: {
        display: false
    },
    // storageBoxId: {
    //     display: false
    // },
    pelletId: {
        display: false
    },
    dnaConcentration: {
        header: 'DNA conc (ng/μL)',
    },
    dnaVolume: {
        header: 'DNA vol (μL)',
    },
    dnaYield: {
        header: 'DNA yield (μg)',
    },
    rnaConcentration: {
        header: 'RNA conc (ng/μL)',
    },
    rnaVolume: {
        header: 'RNA vol (μL)',
    },
    rnaYield: {
        header: 'RNA yield (μg)',
    },
}
const fieldDefs = {
    extractionExperimentId: {
        label: 'Experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/extraction-experiments`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
        }
    },
    // storageBoxId: {
    //     label: 'Storage box',
    //     component: 'AutoCompleter',
    //     props: {
    //         searchBaseUrl: `${config.public.apiBase}/storage-boxes`,
    //         searchFields: ['name'],
    //         valueField: 'id',
    //         displayFields: ['name'],
    //     }
    // },
    pelletId: {
        label: 'Pellet',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/pellets`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name', 'isBackup'],
            displayFormat: (x: any) => x.isBackup ? `${x.name} (backup)` : x.name,
        }
    },
    dnaConcentration: {
        label: 'DNA concentration (ng/μL)',
    },
    dnaVolume: {
        label: 'DNA volume (μL)',
    },
    dnaYield: {
        label: 'DNA yield (μg)',
    },
    rnaConcentration: {
        label: 'RNA concentration (ng/μL)',
    },
    rnaVolume: {
        label: 'RNA volume (μL)',
    },
    rnaYield: {
        label: 'RNA yield (μg)',
    },
}
const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})
const readonlyValues = queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="nucleicAcidsTable"
                tableName="nucleicAcids"
                schemaName="select"
                title="Nucleic Acids"
                :columnDefs="columnDefs"
                :where="whereClauses"
                :withClause="displayWithClause"
                :canEditMultiple="true"
                :selectionDisabled="showAddForm || showEditForm || showMultipleEditForm"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedMultipleRecordEdit="didClickMultipleRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm || showMultipleEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="nucleicAcids"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="nucleicAcids"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="nucleic-acids"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
