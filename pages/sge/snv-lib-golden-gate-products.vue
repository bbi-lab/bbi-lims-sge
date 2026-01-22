
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
    const queryParamFilters = _.map(newValue, (val, key) => {
        return {"==": [{"var": key}, val] }
    })
    whereClauses.value = _.size(queryParamFilters) > 1 ? {and: queryParamFilters} : queryParamFilters
    readonlyValues.value = newValue
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
        index: 1,
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
        index: 2,
    },
    snvLibAmpProductId: { display: false },
    snvLibClonalDnaProduct: {
        header: 'Associated SNVlib Clonal DNA Product',
        type: 'element',
        element: (data: any) => {
            const href = data.snvLibClonalDnaProduct?.id ? `/sge/snv-lib-clonal-dna-products?id=${data.snvLibClonalDnaProduct?.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${data.snvLibClonalDnaProduct?.name}</a>` : ''
        },
        exportValue: (data: any) => {
            return _.get(data.snvLibClonalDnaProduct, 'name', '')
        },
        index: 3,
    },
    snvLibClonalDnaProductId: { display: false },
    goldenGateProductVectorAmount: {
        header: 'Golden Gate Product Vector Amount (ng)',
    },
}
// fieldDefs is computed so we can access crudTable.state.editingRecord and crudTable.state.editingMultipleRecordsIds
// to apply additional logic to certain properties (e.g. readOnly, searchWhereClause)
const fieldDefs: ComputedRef<FieldDefinitions> = computed(() => {
    return {
        name: {
            index: 0,
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
            index: 1,
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
            index: 2,
        },
        snvLibClonalDnaProductId: {
            label: 'SNVlib Clonal DNA Product',
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/snv-lib-clonal-dna-products`,
                searchFields: ['name'],
                valueField: 'id',
                displayFields: ['name'],
                dropdown: true,
            },
            index: 3,
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
    snvLibClonalDnaProduct: {
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
