
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import { RecordService } from '~/utils/service/RecordService'

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
    haPuc19GibsonProductId: { display: false },
    eColiStellarVolume: {
        header: 'E. coli Stellar Volume (µL)',
    },
    haCloningExperiment: {
        header: 'HA Cloning Experiment',
        type: 'element',
        element: (data: any) => {
            const href = data.haPuc19GibsonProduct?.haPuc19PcrProduct?.haPcrProduct?.haCloningExperiment?.id ? `/sge/ha-cloning-experiments?id=${data.haPuc19GibsonProduct.haPuc19PcrProduct.haPcrProduct.haCloningExperiment.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${data.haPuc19GibsonProduct?.haPuc19PcrProduct?.haPcrProduct?.haCloningExperiment?.name}</a>` : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'haPuc19GibsonProduct.haPuc19PcrProduct.haPcrProduct.haCloningExperiment.name', '')
        },
        index: 1,
    },
    // haPuc19Primers: {
    //     header: 'HA pUC19 Primers',
    //     format: (data: any) => {
    //         return _.compact([data.haPuc19PrimerForward?.name, data.haPuc19PrimerReverse?.name ]).join(', ')
    //     },
    //     path: 'haPuc19Primers.displayValue',
    //     index: 2,
    // },
    // haPcrProductId: { display: false },
    // haPuc19PrimerForwardId: { display: false },
    // haPuc19PrimerReverseId: { display: false },
    // temperatureUsed: {
    //     header: 'Temp. Used (°C)',
    // },
    transformedBy: {
        path: 'transformedBy.name'
    },
    colonyPickedBy: {
        path: 'colonyPickedBy.name'
    },
    preppedBy: {
        path: 'preppedBy.name'
    },
}
const fieldDefs: FieldDefinitions = {
    haPuc19GibsonProductId: {
        label: 'HA pUC19 Gibson Product',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/ha-puc-19-gibson-products`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 1,
        events: {
            change: async (record: any, recordOld: any) => {
                // auto-calculate name if homologyArmPrimerId changes
                if (record?.haPuc19GibsonProductId != recordOld?.haPuc19GibsonProductId) {
                    if (!record?.haPuc19GibsonProductId) {
                        record.name = ''
                        record.sequence = ''
                    } else {
                        const haPuc19GibsonProduct = await RecordService.getRecord(`${config.public.apiBase}/ha-puc-19-gibson-products`, record.haPuc19GibsonProductId as string, {})
                        record.name = _.replace(haPuc19GibsonProduct.name, /_gibson$/gi , '_plasmid')
                    }
                }
            },
        },
    },
    eColiStellarVolume: {
        label: 'E. coli Stellar Volume (µL)',
        props: {
            defaultValue: 20,
        }
    },
    transformedBy: {
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        }
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
    colonyPickedBy: {
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
    transformedBy: {
        columns: {id: true, name: true},
    },
    colonyPickedBy: {
        columns: {id: true, name: true},
    },
    preppedBy: {
        columns: {id: true, name: true},
    },
    haPuc19GibsonProduct: {
        columns: {id: true, name: true},
        with: {
            haPuc19PcrProduct: {
                columns: {id: true, name: true},
                with: {
                    haPcrProduct: {
                        columns: {id: true, name: true},
                        with: {
                            haCloningExperiment: {
                                columns: {id: true, name: true},
                            },
                        }
                    },
                },
            },
        },
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="ha-puc-19-plasmids"
                schemaName="select"
                title="HA pUC19 Plasmids"
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
                tableName="ha-puc-19-plasmids"
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
                tableName="ha-puc-19-plasmids"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="ha-puc-19-plasmids"
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
