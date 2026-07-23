
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'

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

const columnDefs = {
    name: {
        index: 1,
    },
    clonalHaTargets: {
        header: 'Targets',
        format: (data: any) => {
            return _.map(data.clonalHaTargets, 'target.name')
        },
        path: 'clonalHaTargets.displayValue',
        index: 2,
    },
    snvLibCloningExperiments: {display: false},
    snvLibGoldenGateProducts: {display: false},

}

const fieldDefs: FieldDefinitions = {
    'clonalHaTargets.*': {
        label: 'Targets',
        component: 'InputArray',
        canDelete: true,
        canUpdate: true,
        props: {
            components: [
                {
                    variableField: 'targetId',
                    label: 'Target',
                    component: 'AutoCompleter',
                    componentProps: {
                        searchBaseUrl: `${config.public.apiBase}/targets`,
                        searchFields: ['region.gene.symbol', 'region.name', 'name'],
                        valueField: 'id',
                        inputClass: 'w-64',
                        displayFormat: (x: any) => {
                            return x.name ?? `${x.region?.gene?.symbol}: ${x.region?.name}`
                        },
                        searchWithClause: {region: {columns: {name: true}, with: {gene: {columns: {symbol:true}}}}},
                    },
                },
            ]
        }
    },
    snvLibCloningExperiments: {display: false},
    snvLibGoldenGateProducts: {display: false},
}
const displayWithClause = {
    clonalHaTargets: {
        with: {
            target: {
                columns: {
                    id: true,
                    name: true,
                }
            },
        }
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="clonal-has"
                schemaName="select"
                title="Clonal Homology Arms"
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
                tableName="clonal-has"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="clonal-has"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="{clonalHaTargets: true}"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="clonal-has"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="{clonalHaTargets: true}"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
