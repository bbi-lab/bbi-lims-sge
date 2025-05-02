
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'

const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingRecordId = ref<string | null>(null)
const editingMultipleRecordsIds = ref<string[]>([])
const plasmidsTable = ref()
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
    event.forEach(e => {
        if (e.id) plasmidsTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
function didAddRecord(event: any) {
    plasmidsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event: any) {
    plasmidsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event: any) {
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
    // storageBox: {
    //     path: 'storageBox.name',
    //     index: 3,
    // },
    // storageBoxLoc: {
    //     index: 4,
    // },
    externalLink: {
        format: 'hyperlink',
        index: 3,
    },
    plasmidExperimentId: {
        display: false
    },
    // storageBoxId: {
    //     display: false
    // },
    targetId: {
        display: false
    }
}
const fieldDefs: FieldDefinitions = {
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
    externalLink: {
        type: 'hyperlink',
    },
}
const displayWithClause = {
    target: {
        columns: {name: true},
        with: {
            region: {
                columns: {name: true},
                with: {
                    gene: {columns: {symbol: true}}
                }
            }
        }
    },
    plasmidExperiment: {
        columns: {name: true},
        // storageBox: {columns: {name: true}
    }
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
                :withClause="displayWithClause"
                :canEditMultiple="true"
                :selectionDisabled="showAddForm || showEditForm || showMultipleEditForm"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
                @clickedMultipleRecordEdit="didClickMultipleRecordEdit"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm || showMultipleEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="plasmids"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :withClause="{plasmidExperiment: true}"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="plasmids"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="{plasmidExperiment: true}"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="plasmids"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
