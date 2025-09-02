
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
    const queryParamFilters = _.map(newValue, (val, key) => {
        return {"==": [{"var": key}, val] }
    })
    whereClauses.value = _.size(queryParamFilters) > 1 ? {and: queryParamFilters} : queryParamFilters
    readonlyValues.value = newValue
    tableKey.value = uuidv4()
}, { immediate: true })

const columnDefs = {
    name: {
        index: 0,
    },
    haCloningExperiment: {
        header: 'HA Cloning Experiment',
        path: 'haCloningExperiment.name',
        index: 1,
    },
    haPrimers: {
        header: 'HA Primers',
        format: (data: any) => {
            return _.compact([data.haPrimerForward?.name, data.haPrimerReverse?.name ]).join(', ')
        },
        path: 'haPrimers.displayValue',
        index: 2,
    },
    haCloningExperimentId: { display: false },
    haPrimerForwardId: { display: false },
    haPrimerReverseId: { display: false },
    wtHap1DnaConcentration: {
        header: 'WT HAP1 DNA Conc. (ng/µL)',
    },
    temperatureChosen: {
        header: 'Temp. Chosen (°C)',
    },
    performedBy: {
        path: 'performedBy.name'
    }
}
const fieldDefs: FieldDefinitions = {
    name: {
        index: 0,
    },
    haCloningExperimentId: {
        label: 'HA Cloning Experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/ha-cloning-experiments`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 1,
    },
    haPrimerForwardId: {
        label: 'HA Primer Forward',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/homology-arm-primers`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            searchWhereClause: {"==": [{"var": "sequenceType"}, "forward"]},
        },
        index: 2,
    },
    haPrimerReverseId: {
        label: 'HA Primer Reverse',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/homology-arm-primers`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            searchWhereClause: {"==": [{"var": "sequenceType"}, "reverse"]},
        },
        index: 3,
    },
    wtHap1DnaConcentration: {
        label: 'WT HAP1 DNA Concentration (ng/µL)',
    },
    performedBy: {
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        }
    },
}
const displayWithClause = {
    performedBy: {
        columns: {id: true, name: true},
    },
    haCloningExperiment: {
        columns: {id: true, name: true},
    },
    haPrimerForward: {
        columns: {id: true, name: true},
    },
    haPrimerReverse: {
        columns: {id: true, name: true},
    },
    wellable: {
        with: {
            wellContents: {
                columns: {id: true, name: true},
                with: {
                    well: {
                        columns: {id: true, name: true},
                        with: {
                            plate: {
                                columns: {id: true, name: true},
                            }
                        }
                    }
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
                tableName="ha-pcr-products"
                schemaName="select"
                title="HA PCR products"
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
                tableName="ha-pcr-products"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :withClause="{haCloningExperiment: true}"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="ha-pcr-products"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="ha-pcr-products"
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
