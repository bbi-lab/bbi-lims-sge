<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const transfectTargetsTable = ref()
const tableTitle = ref(null)
const router = useRouter()
const config = useRuntimeConfig()

const rowActions = {}
const route = useRoute()
//const queryParams = route.query

onMounted(async() => {
    if (route.params.id) {
        const experiment = await RecordService.getRecord(`${config.public.apiBase}/transfect-experiments`, route.params.id)
        tableTitle.value = `${experiment.name}: targets`
    } else {
        tableTitle.value = 'Transfection experiment targets'
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
    transfectTargetsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    transfectTargetsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    transfectTargetsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs = {
    target: {
        format: (x) => { return x.target?.name || `${x.target?.region?.gene?.symbol}: ${x.target?.region?.name}` },
        index: 0,
    },
    experimentId: {
        display: false,
    },
    targetId: {
        display: false,
    },
    snvLibraryConc: {
        header: 'SNV library conc. (ng/μL)',
    },
    snvLibraryTo3ugVol: {
        header: 'Vol. of SNVlib to 3µg (μL)',
    },
    sgRna: {
        header: 'sgRNA',
    },
    sgRnaConc: {
        header: 'Current sgRNA conc. (ng/μL)'
    },
    sgRnaTo12ugVol: {
        header: 'Vol. of sgRNA to 12µg (μL)'
    },
    sgRnaNegControl: {
        header: 'sgRNA negative control'
    },
    hprt1SgRnaConc: {
        header: 'HPRT1 sgRNA conc. (ng/μL)'
    },
    hprt1SgRnaTo12ugVol: {
        header: 'Vol. of HPRT1 sgRNA to 12µg (μL)'
    },
    xfectBuffer: {
        header: 'Xfect Buffer (μL)'
    },
    xfectPolymerPerTransfect: {
        header: 'Xfect polymer (μL) per transfection'
    },
    transfectionCount: {
        header: '# transfections'
    },
    snvLibNeeded: {
        header: 'SNV library needed (μL)'
    },
    sgRnaNeeded: {
        header: 'sgRNA needed (μL)'
    }
}

// Generate field defs from column defs to avoid repeating ourselves
const editFormFieldDefs = _.mapValues(columnDefs, (v, k) => { 
    return {
        display: v.display ?? true, 
        label: v.header || k,
    }
})
// Include an AutoCompleter widget for adding new targets
editFormFieldDefs['targetId'] = {
    label: 'Target',
    component: 'AutoCompleter',
    readOnly: true,
    props: {
        searchBaseUrl: `${config.public.apiBase}/targets`,
        searchFields: ['region.gene.symbol', 'region.name', 'name'],
        valueField: 'id',
        displayFormat: (x) => {
            return x.name ?? `${x.region?.gene?.symbol}: ${x.region?.name}`
        },
        searchWithClause: {region: {columns: {name: true}, with: {gene: {columns: {symbol:true}}}}},
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
                ref="transfectTargetsTable"
                tableName="transfectTargets"
                schemaName="select"
                :title="tableTitle"
                :rowActions="rowActions"
                :columnDefs="columnDefs"
                :where="{'==':[{'var': 'experimentId'}, route.params.id]}"
                :withClause="{target: {columns: {name: true}, with: {region: {columns: {name: true}, with: {gene: {columns: {symbol: true}}}}}}}"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="transfectTargets"
                schemaName="insert"
                :fieldDefs="addFormFieldDefs"
                :defaultValues="defaultValues"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="transfectTargets"
                schemaName="update"
                :fieldDefs="editFormFieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
