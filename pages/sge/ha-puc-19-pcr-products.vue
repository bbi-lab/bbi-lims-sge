
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
        type: 'element',
        element: (data: any) => {
            const href = data.haPcrProduct?.haCloningExperiment?.id ? `/sge/ha-cloning-experiments?id=${data.haPcrProduct.haCloningExperiment.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${data.haPcrProduct?.haCloningExperiment?.name}</a>` : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'haPcrProduct.haCloningExperiment.name', '')
        },
        index: 1,
    },
    haPuc19Primers: {
        header: 'HA pUC19 Primers',
        format: (data: any) => {
            return _.compact([data.haPuc19PrimerForward?.name, data.haPuc19PrimerReverse?.name ]).join(', ')
        },
        path: 'haPuc19Primers.displayValue',
        index: 2,
    },
    haPcrProductId: { display: false },
    haPuc19PrimerForwardId: { display: false },
    haPuc19PrimerReverseId: { display: false },
    temperatureUsed: {
        header: 'Temp. Used (°C)',
    },
    cleanedBy: {
        path: 'performedBy.name'
    },
}
const fieldDefs: FieldDefinitions = {
    name: {
        index: 0,
    },
    haPcrProductId: {
        label: 'HA PCR Product',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/ha-pcr-products`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 1,
    },
    haPuc19PrimerForwardId: {
        label: 'HA pUC19 Primer Forward',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/homology-arm-puc-19-primers`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            searchWhereClause: {"==": [{"var": "sequenceType"}, "forward"]},
        },
        index: 2,
    },
    haPuc19PrimerReverseId: {
        label: 'HA pUC19 Primer Reverse',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/homology-arm-puc-19-primers`,
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
    cleanedBy: {
        columns: {id: true, name: true},
    },
    haPcrProduct: {
        columns: {
            id: true,
            name: true
        },
        with: {
            haCloningExperiment: {
                columns: {id: true, name: true},
            },
        },
    },
    haPuc19PrimerForward: {
        columns: {id: true, name: true},
    },
    haPuc19PrimerReverse: {
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
                tableName="ha-puc-19-pcr-products"
                schemaName="select"
                title="HA pUC19 PCR products"
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
                tableName="ha-puc-19-pcr-products"
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
                tableName="ha-puc-19-pcr-products"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="ha-puc-19-pcr-products"
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
