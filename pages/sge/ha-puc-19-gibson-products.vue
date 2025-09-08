
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
const showCalcsInfo = ref(false)

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
            const href = data.haCloningExperimentId ? `/sge/ha-cloning-experiments?id=${data.haCloningExperimentId}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${data.haCloningExperimentName}</a>` : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'haCloningExperimentId', '')
        },
        index: 1,
    },
    haCloningExperimentId: { display: false },
    haCloningExperimentName: { display: false },
    haPuc19PcrProductId: { display: false },
    haPuc19PcrProductName: { display: false },
    haPcrProductId: { display: false },
    haPcrProductName: { display: false },
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
    haPcrProductLength: {
        header: 'Insert DNA Length (bp)',
        index: 5,
        bodyClass: 'italic font-bold',
    },
    insertDnaMass: {
        header: 'Insert DNA - 2:1 (ng)',
        index: 6,
        format: (data: any) => _.round(data.insertDnaMass, 1),
        path: 'insertDnaMass.displayValue',
        bodyClass: 'italic font-bold',
    },
    insertVolumeRounded: {
        header: 'Insert volume (µL)',
        index: 6,
        format: (data: any) => _.round(data.insertVolume, 1),
        path: 'insertVolumeRounded.displayValue',
        bodyClass: 'italic font-bold',
    },
    vectorVolumeRounded: {
        header: 'Vector volume (µL)',
        index: 7,
        format: (data: any) => _.round(data.vectorVolume, 1),
        path: 'vectorVolumeRounded.displayValue',
        bodyClass: 'italic font-bold',
    },
    vectorVolume: { display: false },
    insertVolume: { display: false },
    vectorPlusInsertVolume: {
        header: 'Insert + Vector Volume (µL)',
        index: 7,
        format: (data: any) => {
            if (data.vectorVolume && data.insertVolume) {
                const totalVolume = data.vectorVolume + data.insertVolume
                return _.round(totalVolume, 1)
            }
            return null
        },
        path: 'vectorPlusInsertVolume.displayValue',
        bodyClass: 'italic font-bold',
    },
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
                tableName="view-ha-puc-19-gibson-products-with-calcs"
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
            >
                <template #header-buttons>
                    <Button
                        icon="pi pi-info-circle"
                        severity="info"
                        label="Calcs"
                        @click="showCalcsInfo = true"
                    />
                </template>
            </QuickTable>
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
    <Dialog
        v-model:visible="showCalcsInfo"
        header="HA pUC19 Gibson product calculations"
        :modal="true"
        :closable="true"
        :style="{width: '50vw'}"
    >
        <template #closebutton>
            <Button icon="pi pi-times" class="p-button-text" severity="secondary" @click="showCalcsInfo = false" />
        </template>
        <div class="mb-4">
            The following calculations are used for HA pUC19 Gibson products:
        </div>
        <ul class="list-disc list-inside mb-4">
            <li>Insert DNA length = HA PCR product stop position - HA PCR product start position + 1</li>
            <li>Insert DNA mass (ng) = Insert length (bp) / pUC19 Vector length (bp) * Vector amount (ng) * 2 </li>
            <li>Insert volume (µL) = Insert DNA mass (ng) / Quant (ng/µL)</li>
            <li>Vector volume (µL) = pUC19 Vector amount (ng) / pUC19 Vector Concentration (ng/µL)</li>
            <li>Total volume (µL) = Insert volume (µL) + Vector volume (µL)</li>
        </ul>
        <div>Precise values are used for calculations, and rounded to 1 decimal place for display.</div>
        <div>For reference, the pUC19 vector length is <i><b>2649</b></i> bp.</div>
    </Dialog>
</template>
