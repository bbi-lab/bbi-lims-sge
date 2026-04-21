<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'
import { v4 as uuidv4 } from 'uuid'

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

const displayWithClause = Object.freeze({
    gene: {
        columns: {
            id: true,
            symbol: true,
            ncbiAccession: true,
        },
    },
    wellable: {
        with: {
            wellContents: {
                with: {
                    well: {
                        columns: {
                            id: true,
                            x: true,
                            y: true,
                        },
                        with: {
                            plate: {
                                columns: {
                                    id: true,
                                    name: true,
                                    plateType: true,
                                }
                            }
                        }
                    },
                },
            },
        }
    }
})

const columnDefs = {
    name: {
        index: 1
    },
    geneId: {display: false},
    gene: {
        format: (x: any) => {
            return `${x.gene?.symbol} (${x.gene?.ncbiAccession})`
        },
        path: 'gene.displayValue',
        index: 2,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            return combinedWellLocations(x) as string
        },
        path: 'wellContents.displayValue',
        type: 'string',
        index: 5,
    },
}

const fieldDefs: FieldDefinitions = {
    name: {index: 1},

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
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :key="tableKey"
                :ref="crudTable.setTableRef"
                tableName="rna-rt-primers"
                schemaName="select"
                title="RNA RT Primers"
                :withClause="displayWithClause"
                :where="whereClauses"
                :columnDefs="columnDefs"
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
                tableName="rna-rt-primers"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="rna-rt-primers"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="rna-rt-primers"
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
