
<script setup>

const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingMultipleRecordsIds = ref([])
const editingRecordId = ref(null)
const nucleicAcidsTable = ref()

const route = useRoute()
const config = useRuntimeConfig()
const queryParams = route.query

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
function didClickMultipleRecordEdit(recordIds) {
    editingMultipleRecordsIds.value = recordIds
    showMultipleEditForm.value = true
    showEditForm.value = false
    showAddForm.value = false
}
function didClickCancelMultipleEditForm() {
    editingMultipleRecordsIds.value = []
    showMultipleEditForm.value = false
}
function didUpdateMultipleRecords(event) {
    event.forEach(e => {
        if (e.id) nucleicAcidsTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
function didAddRecord(event) {
    nucleicAcidsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    nucleicAcidsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
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
        columns: {},
        with: {
            transfectTarget: {
                columns: {},
                with: {
                    experiment: {
                        columns: {name: true}
                    },
                    target: {
                        columns: {name: true}
                    }
                }
            }
        }
    },
})
const columnDefs = {
    pellet: {
        format: (x) => `${x.pellet?.transfectTarget?.experiment?.name}: ${x.pellet?.transfectTarget?.target?.name}`,
        path: 'pellet.displayValue',
        type: 'string',
        index: 1,
    },
    extractionExperiment: {
        path: 'extractionExperiment.name',
        index: 2,
    },
    // storageBox: {
    //     path: 'storageBox.name',
    //     index: 3,
    // },
    // storageBoxLoc: {
    //     index: 4,
    // },
    protocol: {
        index: 3,
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
            searchFields: ['transfectTarget.experiment.name', 'transfectTarget.target.name'],
            searchWithClause: {
                transfectTarget: {columns: {}, with: {experiment: {columns: {name: true}}, target: {columns: {name: true}}}},
            },
            valueField: 'id',
            displayFields: ['transfectTarget.experiment.name', 'transfectTarget.target.name'],
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
const defaultValues = queryParams
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
                :defaultValues="defaultValues"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="nucleicAcids"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :defaultValues="defaultValues"
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
                :defaultValues="defaultValues"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
