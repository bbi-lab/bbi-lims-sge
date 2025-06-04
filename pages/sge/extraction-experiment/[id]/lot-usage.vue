<script setup lang="ts">
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const extractionLotUsageTable = ref()
const tableTitle = ref<string | null>(null)
const router = useRouter()
const config = useRuntimeConfig()

const rowActions = {}
const route = useRoute()

onMounted(async() => {
    const experiment = await RecordService.getRecord(`${config.public.apiBase}/extraction-experiments`, route.params.id as string, {})
    tableTitle.value = `${experiment.name}: Reagents`
})

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
    extractionLotUsageTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event: any) {
    extractionLotUsageTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event: any) {
    extractionLotUsageTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs: ColumnDefinitions = {
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
        format: (x) => `${x.concentration || '--'} ${x?.lot?.reagent?.soluteUnit}/${x?.lot?.reagent?.volumeUnit}`,
        path: 'concentration.displayValue',
        type: 'string',
    },
    volumeUsed: {
        format: (x) => `${x.volumeUsed || '--'} ${x?.lot?.reagent?.soluteUnit}/${x?.lot?.reagent?.volumeUnit}`,
        path: 'concentration.displayValue',
        type: 'string',
    }
}

// Generate field defs from column defs to avoid repeating ourselves
const fieldDefs: FieldDefinitions = _.mapValues(columnDefs, (v, k) => {
    return {
        display: v.display ?? true,
        label: v.header || _.startCase(k),
    }
})
_.set(fieldDefs, 'concentration.label', (data) => data.lot?.reagent ? `Concentration (${data.lot?.reagent?.soluteUnit}/${data?.lot?.reagent?.volumeUnit})` : 'Concentration')
_.set(fieldDefs, 'volumeUsed.label', (data) => data.lot?.reagent ? `Volume Used (${data.lot?.reagent?.soluteUnit}/${data?.lot?.reagent?.volumeUnit})` : 'Volume Used')

// Include an AutoCompleter widget for adding new targets
fieldDefs['lotId'] = {
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

const readonlyValues = {experimentId: route.params.id}  // queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="extractionLotUsageTable"
                tableName="extraction-lot-usage"
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
                tableName="extraction-lot-usage"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                :withClause="{lot: {columns: {lotNumber: true}, with: {reagent: true}}}"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="extraction-lot-usage"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="{lot: {columns: {lotNumber: true}, with: {reagent: true}}}"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
