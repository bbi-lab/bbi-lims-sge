<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'
import { targets } from '~/server/db/schema/sge/target'
const router = useRouter()

const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingRecordId = ref(null)
const editingMultipleRecordsIds = ref([])
const regionsTable = ref()
const route = useRoute()
const queryParams = route.query
const config = useRuntimeConfig()
const tableTitle = ref(null)

onMounted(async() => {
    if (queryParams.targetId) {
        const target = await RecordService.getRecord(`${config.public.apiBase}/targets`, queryParams.targetId)
        tableTitle.value = `${target.name}: regions`
    } else {
        tableTitle.value = `All Regions`
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
        if (e.id) regionsTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
function didAddRecord(event) {
    regionsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    regionsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    regionsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}

const displayWithClause = Object.freeze({
    gene:{
        columns: {symbol: true, ncbiAccession: true}
    },
    targets: {
        columns: {id: true}
    },
})
const columnDefs = {
    geneId: {
        header: 'Gene',
        format: (x) => { return `${_.get(x, 'gene.symbol')} (${_.get(x, 'gene.ncbiAccession')})`},
        path: 'geneId.displayValue',
        index: 0,
    },
    snvLibraryStart: {
        header: 'SNV library start'
    },
    snvLibraryEnd: {
        header: 'SNV library end'
    },
    targets: {
        display: false,
    },
}
const rowActions = {
    targets: {
        label: (data) => { return `${data.targets?.length || 0}`},
        action: (data) => {
            router.push({path:`/sge/targets`, query: {'regionId': data.id}})
        },
        icon: 'pi pi-fw pi-bullseye',
        iconPos: 'right',
        tooltip: 'Targets',
    },
}
const fieldDefs = {
    geneId: {
        label: 'Gene',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/sge-valid-genes`,
            searchFields: ['symbol', 'ncbiAccession'],
            valueField: 'id',
            displayFields: ['symbol', 'ncbiAccession'],
            displayFormat: (x) => `${x.symbol} (${x.ncbiAccession})`,
            searchMode: 'simple',
        }
    },
    snvLibraryStart: {
        label: 'SNV library start'
    },
    snvLibraryEnd: {
        label: 'SNV library end'
    },
    targets: {
        display: false,
    },
}

// convert query params in to JSON Logic to pass as where clause
// TODO - pass more than just the first to QuickTable
const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})
const defaultValues = queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="regionsTable"
                tableName="regions"
                schemaName="select"
                :title="tableTitle"
                :where="whereClauses[0]"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                :rowsPerPageOptions="[10, 25, 50, 100]"
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
                tableName="regions"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :defaultValues="defaultValues"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="regions"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :defaultValues="defaultValues"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="regions"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
