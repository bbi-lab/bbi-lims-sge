
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'

const config = useRuntimeConfig()
const crudTable = useCrudTable()
const route = useRoute()
const {user} = useUserSession()

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
            const href = data.haPuc19PcrProduct?.haPcrProduct?.haCloningExperiment?.id ? `/sge/ha-cloning-experiments?id=${data.haPuc19PcrProduct.haPcrProduct.haCloningExperiment.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${data.haPuc19PcrProduct?.haPcrProduct?.haCloningExperiment?.name}</a>` : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'haPuc19PcrProduct.haPcrProduct.haCloningExperiment.name', '')
        },
        index: 1,
    },
    haPuc19PcrProductId: { display: false },
    puc19VectorConcentration: {
        header: 'pUC19 Vector Conc. (ng/µL)',
        index: 2,
    },
    puc19VectorAmount: {
        header: 'pUC19 Vector Amount (ng)',
        index: 3,
    },
    quant: {
        header: 'Quant (ng/µL)',
        index: 4,
    },
    preppedBy: {
        path: 'preppedBy.name',
    }

}
const fieldDefs: FieldDefinitions = {
    name: {
        index: 0,
    },
    haPuc19PcrProductId: {
        label: 'HA pUC19 PCR Product',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/ha-puc-19-pcr-products`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 1,
    },
    preppedBy: {
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        }
    },
    puc19VectorConcentration: {
        label: 'pUC19 Vector Concentration (ng/µL)',
    },
    puc19VectorAmount: {
        label: 'pUC19 Vector Amount (ng)',
        subtext: 'Vector Size (bp): 2649',
    },
    quant: {
        label: 'Quant (ng/µL)',
    },
}
const displayWithClause = {
    preppedBy: {
        columns: {id: true, name: true},
    },
    haPuc19PcrProduct: {
        with: {
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
            }
        }
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
                tableName="ha-puc-19-gibson-products"
                schemaName="select"
                title="HA pUC19 Gibson products"
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
                tableName="ha-puc-19-gibson-products"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                :values="{
                    preppedOn: new Date(),
                    preppedBy: _.get(user, 'id'),
                    puc19VectorAmount: 50,
                }"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="ha-puc-19-gibson-products"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="ha-puc-19-gibson-products"
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
