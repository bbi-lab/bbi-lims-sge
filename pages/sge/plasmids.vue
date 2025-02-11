
<script setup>
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const plasmidsTable = ref()
const router = useRouter()
const config = useRuntimeConfig()

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
    plasmidsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    plasmidsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    plasmidsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs = {
    plasmidType: {
        header: 'Type',
        index: 0,
    },
    target: {
        path: 'target.name',
        type: 'string',
        index: 1,
    },
    plasmidExperiment: {
        path: 'plasmidExperiment.name',
        index: 2,
    },
    storageBox: {
        path: 'storageBox.name',
        index: 3,
    },
    storageBoxLoc: {
        index: 4,
    },
    plasmidExperimentId: {
        display: false
    },
    storageBoxId: {
        display: false
    },
    targetId: {
        display: false
    }
}
const fieldDefs = {
    plasmidExperimentId: {
        label: 'Experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/plasmid-experiments`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
        }
    },
    storageBoxId: {
        label: 'Storage box',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/storage-boxes`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
        }
    },
    targetId: {
        label: 'Target',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/targets`,
            searchFields: ['name', 'region.gene.symbol', 'region.name'],
            searchWithClause: {
                region: {columns: {name: true}, with: {gene: {columns: {symbol: true}}}},
            },
            valueField: 'id',
            displayFields: ['name', 'region.gene.symbol', 'region.name'],
        }
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="plasmidsTable"
                tableName="plasmids"
                schemaName="select"
                title="Plasmids"
                :columnDefs="columnDefs"
                :withClause="{target: {columns: {name: true}, with: {region: {columns: {name: true}, with: {gene: {columns: {symbol: true}}}}}}, plasmidExperiment: {columns: {name: true}}, storageBox: {columns: {name: true}}}"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="plasmids"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :withClause="{plasmidExperiment: true, storageBox: true}"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="plasmids"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="{plasmidExperiment: true, storageBox: true}"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
