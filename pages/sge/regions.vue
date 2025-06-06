<script setup lang="ts">
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
const router = useRouter()
const crudTable = useCrudTable()

const route = useRoute()
const queryParams = route.query
const config = useRuntimeConfig()
const tableTitle = ref<string>()

onMounted(async() => {
    if (queryParams.targetId) {
        const target = await RecordService.getRecord(`${config.public.apiBase}/targets`, queryParams.targetId as string, {})
        tableTitle.value = `${target.name}: regions`
    } else {
        tableTitle.value = `All Regions`
    }
})

const displayWithClause = Object.freeze({
    gene:{
        columns: {symbol: true, ncbiAccession: true}
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

// convert query params in to JSON Logic to pass as where clause
// TODO - pass more than just the first to QuickTable
const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})
const readonlyValues = queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="regions"
                schemaName="select"
                :title="tableTitle"
                :where="whereClauses[0]"
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
