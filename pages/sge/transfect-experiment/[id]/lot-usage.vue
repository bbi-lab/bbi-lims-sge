<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const transfectLotUsageTable = ref()
const tableTitle = ref(null)
const router = useRouter()
const config = useRuntimeConfig()

const rowActions = {}
const route = useRoute()

onMounted(async() => {
    const experiment = await RecordService.getRecord(`${config.public.apiBase}/transfect-experiments`, route.params.id)
    tableTitle.value = `${experiment.name}: Reagents`
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
    transfectLotUsageTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    transfectLotUsageTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    transfectLotUsageTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs = {
    experimentId: {
        display: false,
    },
    lotId: {
        display: false,
    },
    reagent: {
        index: 1,
        path: 'lot.reagent.name',
    },
    lot: {
        header: 'Lot #',
        path: 'lot.lotNumber',
        index: 0,
    },
    concentration: {
        format: (x) => `${x.concentration} ${x?.lot?.reagent?.soluteUnit}/${x?.lot?.reagent?.volumeUnit}`
    }
}

// Generate field defs from column defs to avoid repeating ourselves
const editFormFieldDefs = _.mapValues(columnDefs, (v, k) => { 
    return {
        display: v.display ?? true, 
        label: v.header || k,
    }
})
_.set(editFormFieldDefs, 'concentration.label', (data) => data.lot?.reagent ? `Concentration (${data.lot?.reagent?.soluteUnit}/${data?.lot?.reagent?.volumeUnit})` : 'Concentration')

// Include an AutoCompleter widget for adding new targets
editFormFieldDefs['lotId'] = {
    label: 'Lot',
    component: 'AutoCompleter',
    props: {
        searchBaseUrl: `${config.public.apiBase}/lots`,
        searchFields: ['lotNumber', 'reagent.name'],
        valueField: 'id',
        displayFormat: (x) => `${x.lotNumber}: ${x.reagent.name}`,
        searchWithClause: {reagent: {columns: {name: true}}},
    },
}

const addFormFieldDefs = _.cloneDeep(editFormFieldDefs)
_.set(addFormFieldDefs, 'targetId.readOnly', false)

const defaultValues = {experimentId: route.params.id}  // queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="transfectLotUsageTable"
                tableName="transfectLotUsage"
                schemaName="select"
                :title="tableTitle"
                :rowActions="rowActions"
                :columnDefs="columnDefs"
                :where="{'==':[{'var': 'experimentId'}, route.params.id]}"
                :withClause="{lot: {columns: {lotNumber: true}, with: {reagent: true}}}"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="transfectLotUsage"
                schemaName="insert"
                :fieldDefs="addFormFieldDefs"
                :defaultValues="defaultValues"
                :withClause="{lot: {columns: {lotNumber: true}, with: {reagent: true}}}"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="transfectLotUsage"
                schemaName="update"
                :fieldDefs="editFormFieldDefs"
                :withClause="{lot: {columns: {lotNumber: true}, with: {reagent: true}}}"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
