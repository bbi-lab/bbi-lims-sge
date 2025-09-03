<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { v4 as uuidv4 } from 'uuid'

const crudTable = useCrudTable()
const config = useRuntimeConfig()
const route = useRoute()

const showAddDialog = ref(false)
const addFormTableName: Ref<string | undefined> = ref()
const addFormHeader: Ref<string | undefined> = ref()
const addFormFieldDefs: Ref<FieldDefinitions> = ref({})
const addFormReadOnlyValues = ref()

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
        index: 1,
    },
    haCloningExperimentTargets: {
        header: 'Targets',
        format: (data: any) => {
            return _.map(data.haCloningExperimentTargets, 'target.name')
        },
        path: 'haCloningExperimentTargets.displayValue'
    },
    haPcrProducts: {
        header: 'HA PCR Product',
        type: 'element',
        element: (data: any) => {
            const haPcrProduct = _.get(data, 'haPcrProducts.0')
            const href = haPcrProduct?.id ? `/sge/ha-pcr-products?id=${haPcrProduct?.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">✓</a>` : '<a href="#" class="p-button p-button-outlined p-button-info">Add</a>'
        },
        elementClick: (data: any) => {
            if (_.isEmpty(data.haPcrProducts)) {
                addFormReadOnlyValues.value = {
                    name: _.get(data, 'name'),
                    haCloningExperimentId: _.get(data, 'id'),
                }
                addFormTableName.value = 'ha-pcr-products'
                addFormHeader.value = 'Add HA PCR Product'
                addFormFieldDefs.value = haPcrProductFieldDefinitions
                showAddDialog.value = true
            }
        },
        exportValue: (x: any) => {
            return _.has(x.haPcrProducts, '0.id') ? 'true' : 'false'
        },
    },
    haPuc19PcrProducts: {
        header: 'HA pUC19 PCR Product',
        type: 'element',
        element: (data: any) => {
            const haPuc19PcrProduct = _.get(data, 'haPcrProducts.0.haPuc19PcrProducts.0')
            const href = haPuc19PcrProduct?.id ? `/sge/ha-puc-19-pcr-products?id=${haPuc19PcrProduct?.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">✓</a>` :
                 _.get(data, 'haPcrProducts.0.id') ? '<a href="#" class="p-button p-button-outlined p-button-info">Add</a>' : null
        },
        elementClick: (data: any) => {
            if (_.isEmpty(_.get(data, 'haPcrProducts.0.haPuc19PcrProducts'))) {
                addFormReadOnlyValues.value = {
                    name: _.get(data, 'haPcrProducts.0.name'),
                    haPcrProductId: _.get(data, 'haPcrProducts.0.id'),
                }
                addFormTableName.value = 'ha-puc-19-pcr-products'
                addFormHeader.value = 'Add HA pUC19 PCR Product'
                addFormFieldDefs.value = haPuc19PcrProductFieldDefinitions
                showAddDialog.value = true
            }
        },
        exportValue: (x: any) => {
            return _.has(x.haPcrProducts, '0.id') ? 'true' : 'false'
        },
    }
}
const didAddRecord = (event: any) => {
    console.log(event)
    showAddDialog.value = false
    if (event?.haCloningExperimentId) {
        crudTable.tableRef.value.addOrRefreshRecordIds([event.haCloningExperimentId])
    }
}
const fieldDefs: FieldDefinitions = {
    haPcrProducts: { display: false },
    'haCloningExperimentTargets.*': {
        label: 'Targets',
        component: 'InputArray',
        canDelete: false,
        canUpdate: false,
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
}
const withClause = {
    haCloningExperimentTargets: {
        with: {
            target: true,
        }
    },
    haPcrProducts: {
        with: {
            haPuc19PcrProducts: true,
        }
    },
}
const haPcrProductFieldDefinitions: FieldDefinitions = {
    name: { index: 0 },
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
    temperatureChosen: {
        label: 'Temperature Chosen (°C)',
    },
    performedBy: {
        label: 'Performed By',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
    },
}
const haPuc19PcrProductFieldDefinitions: FieldDefinitions = {
    name: { index: 0 },
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
    temperatureUsed: {
        label: 'Temperature Used (°C)',
    },
    cleanedBy: {
        label: 'Cleaned By',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
    },
    quant: {
        label: 'Quant (ng/µL)',
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :key="tableKey"
                :ref="crudTable.setTableRef"
                tableName="ha-cloning-experiments"
                schemaName="select"
                title="Homology Arm Cloning"
                :withClause="withClause"
                :where="whereClauses"
                :columnDefs="columnDefs"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="ha-cloning-experiments"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
                @recordUpdate="crudTable.didUpdateRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="ha-cloning-experiments"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="withClause"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
    <Dialog v-model:visible="showAddDialog" modal :header="addFormTableName" :style="{ width: 'auto' }" :closable="false">
        <QuickForm
            :tableName="addFormTableName"
            schemaName="insert"
            :readonlyValues="addFormReadOnlyValues"
            :fieldDefs="addFormFieldDefs"
            @cancel="showAddDialog = false"
            @recordAdd="didAddRecord"
        />
    </Dialog>
</template>
