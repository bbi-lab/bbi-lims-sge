
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'

const config = useRuntimeConfig()
const crudTable = useCrudTable()
const route = useRoute()

const tableKey = ref<string>(uuidv4())
const whereClauses = ref()
const readonlyValues = ref<Record<string, any>>({})

watch(() => route.query, async (newValue, oldValue) => {
    whereClauses.value = queryParamsToJsonLogic(newValue)
    readonlyValues.value = getSimpleQueryParams(newValue)
    tableKey.value = uuidv4()
}, { immediate: true })

const columnDefs: ColumnDefinitions = {
    name: {
        index: 0,
    },
    snvLibCloningExperiment: {
        header: 'SNV Library Cloning Experiment',
        type: 'element',
        element: (data: any) => {
            const href = data.snvLibCloningExperiment?.id ? `/sge/snv-lib-cloning-experiments?id=${data.snvLibCloningExperiment?.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${data.snvLibCloningExperiment?.name}</a>` : ''
        },
        exportValue: (data: any) => {
            return _.get(data.snvLibCloningExperiment, 'name', '')
        },
        index: 2,
    },
    snvLibCloningExperimentId: { display: false },
    snvLibAmpProduct: {
        header: 'Associated SNVlib AMP Product',
        type: 'element',
        element: (data: any) => {
            const href = data.snvLibAmpProduct?.id ? `/sge/snv-lib-amp-products?id=${data.snvLibAmpProduct?.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${data.snvLibAmpProduct?.name}</a>` : ''
        },
        exportValue: (data: any) => {
            return _.get(data.snvLibAmpProduct, 'name', '')
        },
        index: 3,
    },
    snvLibAmpProductId: { display: false },
    clonalHa: {
        header: 'Associated SNVlib Clonal HA',
        type: 'element',
        element: (data: any) => {
            const href = data.clonalHa?.id ? `/sge/clonal-has?id=${data.clonalHa?.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${data.clonalHa?.name}</a>` : ''
        },
        exportValue: (data: any) => {
            return _.get(data.clonalHa, 'name', '')
        },
        index: 4,
    },
    clonalHaId: { display: false },
    goldenGateProductVectorAmount: {
        header: 'Golden Gate Product Vector Amount (ng)',
    },
    status: {
        type: 'element',
        element: (data: any) => recordStatusTag(data.status),
        // format sets status.displayValue, which the column sorts, searches and exports on
        format: (data: any) => recordStatusLabel(data.status),
        path: 'status.displayValue',
        index: 1,
    },
}
// fieldDefs is computed so we can access crudTable.state.editingRecord and crudTable.state.editingMultipleRecordsIds
// to apply additional logic to certain properties (e.g. readOnly, searchWhereClause)
const fieldDefs: ComputedRef<FieldDefinitions> = computed(() => {
    return {
        name: {
            index: 0,
        },
        status: {
            index: 1,
        },
        snvLibCloningExperimentId: {
            label: 'SNV Library Cloning Experiment',
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/snv-lib-cloning-experiments`,
                searchFields: ['name'],
                valueField: 'id',
                displayFields: ['name'],
                dropdown: true,
            },
            index: 2,
        },
        snvLibAmpProductId: {
            label: 'SNVlib AMP Product',
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/snv-lib-amp-products`,
                searchFields: ['name'],
                valueField: 'id',
                displayFields: ['name'],
                dropdown: true,
            },
            index: 3,
        },
        clonalHaId: {
            label: 'SNVlib Clonal HA',
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/clonal-has`,
                searchFields: ['name'],
                valueField: 'id',
                displayFields: ['name'],
                dropdown: true,
            },
            index: 4,
        }
    }
})
const displayWithClause = {
    snvLibCloningExperiment: {
        columns: {id: true, name: true},
    },
    snvLibAmpProduct: {
        columns: {id: true, name: true},
    },
    clonalHa: {
        columns: {id: true, name: true},
    },
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="snv-lib-golden-gate-products"
                schemaName="select"
                title="Clonal DNA products"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :where="whereClauses"
                :canEditMultiple="true"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="snv-lib-golden-gate-products"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :withClause="{snvLibCloningExperiment: true}"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="snv-lib-golden-gate-products"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="snv-lib-golden-gate-products"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
