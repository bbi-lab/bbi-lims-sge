<script setup lang="ts">
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'

const config = useRuntimeConfig()
const crudTable = useCrudTable()
const route = useRoute()

const tableTitle = ref<string>()
const rowActions = {}

onMounted(async() => {
    const experiment = await RecordService.getRecord(`${config.public.apiBase}/extraction-experiments`, route.params.id as string, {})
    tableTitle.value = `${experiment.name}: Reagents`
})

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
        path: 'volumeUsed.displayValue',
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
_.set(fieldDefs, 'concentration.label', (data: any) => data.lot?.reagent ? `Concentration (${data.lot?.reagent?.soluteUnit}/${data?.lot?.reagent?.volumeUnit})` : 'Concentration')
_.set(fieldDefs, 'volumeUsed.label', (data: any) => data.lot?.reagent ? `Volume Used (${data.lot?.reagent?.soluteUnit}/${data?.lot?.reagent?.volumeUnit})` : 'Volume Used')

// Include an AutoCompleter widget for adding new targets
fieldDefs['lotId'] = {
    label: 'Lot',
    component: 'AutoCompleter',
    props: {
        searchBaseUrl: `${config.public.apiBase}/lots`,
        searchFields: ['lotNumber', 'reagent.name'],
        valueField: 'id',
        displayFormat: (x: any) => `${x.lotNumber}: ${x.reagent.name}`,
        searchWithClause: {reagent: {columns: {name: true}}},
    },
}

const readonlyValues = {experimentId: route.params.id}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="extraction-lot-usage"
                schemaName="select"
                :title="tableTitle"
                :rowActions="rowActions"
                :columnDefs="columnDefs"
                :where="{'==':[{'var': 'experimentId'}, route.params.id]}"
                :withClause="{lot: {columns: {lotNumber: true}, with: {reagent: true}}}"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="extraction-lot-usage"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                :withClause="{lot: {columns: {lotNumber: true}, with: {reagent: true}}}"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="extraction-lot-usage"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="{lot: {columns: {lotNumber: true}, with: {reagent: true}}}"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
