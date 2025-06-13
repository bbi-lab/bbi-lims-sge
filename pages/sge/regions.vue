<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { v4 as uuidv4 } from 'uuid'

const router = useRouter()
const crudTable = useCrudTable()

const route = useRoute()
const config = useRuntimeConfig()
const whereClauses = ref()
const readonlyValues = ref<Record<string, any>>({})
const tableKey = ref<string>(uuidv4())

watch(() => route.query, async (newValue, oldValue) => {
    const queryParamFilters = _.map(newValue, (val, key) => {
        return {"==": [{"var": key}, val] }
    })
    whereClauses.value = _.size(queryParamFilters) > 1 ? {and: queryParamFilters} : queryParamFilters
    readonlyValues.value = newValue
    tableKey.value = uuidv4()
}, { immediate: true })

const displayWithClause = Object.freeze({
    gene:{
        columns: {id: true, symbol: true, ncbiAccession: true}
    },
    targets: {
        columns: {id: true}
    },
})
const columnDefs: ColumnDefinitions = {
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
        label: (data: any) => { return `${data.targets?.length || 0}`},
        action: (data: any) => {
            router.push({path:`/sge/targets`, query: {'regionId': data.id}})
        },
        icon: 'pi pi-fw pi-bullseye',
        iconPos: 'right',
        tooltip: 'Targets',
    },
}
const fieldDefs: FieldDefinitions = {
    geneId: {
        label: 'Gene',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/sge-valid-genes`,
            searchFields: ['symbol', 'ncbiAccession'],
            valueField: 'id',
            displayFields: ['symbol', 'ncbiAccession'],
            displayFormat: (x: any) => `${x.symbol} (${x.ncbiAccession})`,
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
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :key="tableKey"
                :ref="crudTable.setTableRef"
                tableName="regions"
                schemaName="select"
                title="Regions"
                :where="whereClauses"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                :canEditMultiple="true"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="regions"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="regions"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="regions"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
