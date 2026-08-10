
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
        index: 0,
    },
    haCloningExperiment: {
        header: 'HA Cloning Experiment',
        type: 'element',
        element: (data: any) => {
            const href = data.haCloningExperiment?.id ? `/sge/ha-cloning-experiments?id=${data.haCloningExperiment?.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${data.haCloningExperiment?.name}</a>` : null
        },
        exportValue: (data: any) => {
            return _.get(data.haCloningExperiment, 'name', '')
        },
        index: 1,
    },
    haPrimers: {
        header: 'HA Primers',
        type: 'element',
        element: (data: any) => {
            return _.compact(_.map([data.haPrimerForward, data.haPrimerReverse], (primer: any) => {
                return primer?.id ? `<span class="${primer?.archived ? 'line-through' : ''}">${primer.name}</span>` : null
            })).join(', ')
        },
        exportValue: (data: any) => {
            return _.compact([data.haPrimerForward?.name, data.haPrimerReverse?.name]).join(', ')
        },
        path: 'haPrimers.displayValue',
        index: 2,
    },
    startPosition: {
        index: 3,
    },
    stopPosition: {
        index: 4,
    },
    length: {
        header: 'Length (bp)',
        format: (data: any) => {
            if (data.startPosition && data.stopPosition) {
                return Math.abs(data.stopPosition - data.startPosition) + 1
            }
            return null
        },
        path: 'length.displayValue',
        index: 5,
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
    },
    haPuc19PcrProducts: {
        header: 'HA pUC19 PCR Product',
        type: 'element',
        element: (data: any) => {
            const haPuc19PcrProduct = _.get(data, 'haPuc19PcrProducts.0')
            const href = haPuc19PcrProduct?.id ? `/sge/ha-puc-19-pcr-products?id=${haPuc19PcrProduct?.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">✓</a>` : null
        },
        exportValue: (x: any) => {
            return _.has(x.haPcrProducts, '0.id') ? 'true' : 'false'
        },
    },
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
            inputClass: (data: any) => {
                return data?.record?.archived ? 'line-through' : ''
            },
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
            inputClass: (data: any) => {
                return data?.record?.archived ? 'line-through' : ''
            },
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
        columns: {id: true, name: true, archived: true},
    },
    haPrimerReverse: {
        columns: {id: true, name: true, archived: true},
    },
    haPuc19PcrProducts: {
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
                sortField="name"
                :sortOrder="1"
                :rowsPerPageOptions="[10, 25, 50, 100]"
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
