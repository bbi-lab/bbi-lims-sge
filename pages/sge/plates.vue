
<script setup>
import _ from 'lodash'
import { RecordService } from '@/utils/service/RecordService'

const route = useRoute()
const queryParams = route.query

const router = useRouter()
const rowActions = {
    layout: {
        action: (data) => {
            router.push({path:`/sge/plate-diagram/${data.id}`})
        }
    }
}

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const platesTable = ref()

const config = useRuntimeConfig()
const tableTitle = ref(null)

onMounted(async() => {
    if (queryParams.pcrExperimentId) {
        const experiment = await RecordService.getRecord(`${config.public.apiBase}/pcr-experiments`, queryParams.pcrExperimentId)
        tableTitle.value = `${experiment.name}: plates`
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
    platesTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    platesTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    platesTable.value.removeRecordId(event.id)
    showEditForm.value = false
}

// convert query params in to JSON Logic to pass as where clause
// TODO - pass more than just the first to QuickTable
const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})
const defaultValues = queryParams

const columnDefs = {
    pcrExperimentId: {
        display: false,
    },
    sizeX: {
        display: false,
    },
    sizeY: {
        display: false,
    },
    wells: {
        display: false,
    }
}
const fieldDefs = {
    pcrExperimentId: {
        label: 'PCR experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/pcr-experiments`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
        }
    },
    wells: {
        display: false,
    }
}
</script>
<template>
    <Splitter>
        <SplitterPanel :size="50">
            <QuickTable
                ref="platesTable"
                tableName="plates" 
                schemaName="select"
                :title="tableTitle || 'Plates'"
                :columnDefs="columnDefs"
                :where="whereClauses[0]"
                :canAdd="true"
                :canEdit="true"
                :canDelete="true"
                :rowActions="rowActions"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="plates"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :defaultValues="defaultValues"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="plates"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :defaultValues="defaultValues"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
