
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
    whereClauses.value = queryParamsToJsonLogic(newValue)
    readonlyValues.value = getSimpleQueryParams(newValue)
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
    ampPrimers: {
        header: 'AMP Primers',
        type: 'element',
        element: (data: any) => {
            return _.compact(_.map([data.ampPrimerForward, data.ampPrimerReverse], (primer: any) => {
                return primer?.id ? `<span class="${primer?.archived ? 'line-through' : ''}">${primer.name}</span>` : null
            })).join(', ')
        },
        exportValue: (data: any) => {
            return _.compact([data.ampPrimerForward?.name, data.ampPrimerReverse?.name ]).join(', ')
        },
        path: 'ampPrimers.displayValue',
        index: 2,
    },
    sgeOligoId: { display: false },
    sgeOligo: {
        header: 'SGE Oligo',
        path: 'sgeOligo.name',
        index: 3,
    },
    lots: {
        header: 'Lot(s)',
        format: (data: any) => {
            return _.join(_.compact(_.map(data.sgeOligo?.sgeOligoLots, (sgeOligoLot: any) => sgeOligoLot.lot?.lotNumber)), ', ')
        },
        path: 'lots.displayValue',
        index: 4,
    },
    startPosition: {
        index: 5,
    },
    stopPosition: {
        index: 6,
    },
    length: {
        header: 'Length (bp)',
        format: (data: any) => {
            if (data.startPosition && data.stopPosition) {
                return _.toString(Math.abs(data.stopPosition - data.startPosition) + 1)
            } else {
                return ''
            }
        },
        path: 'length.displayValue',
        index: 7,
    },
    snvLibCloningExperimentId: { display: false },
    ampPrimerForwardId: { display: false },
    ampPrimerReverseId: { display: false },
    quant: {
        header: 'Quant (ng/µL)',
    },
    cleanedBy: {
        path: 'cleanedBy.name'
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
        ampPrimerForwardId: {
            label: 'AMP Primer Forward',
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/amplification-primers`,
                searchFields: ['name'],
                valueField: 'id',
                displayFields: ['name'],
                searchWhereClause: {"and": [
                    {"==": [{"var": "sequenceType"}, "forward"]},
                    {"==" : [ {"var":"targetId"}, crudTable.state.editingRecord?.snvLibCloningExperiment?.targetId ]},
                ]},
                dropdown: true,
                inputClass: (data: any) => {
                    return data?.record?.archived ? 'line-through' : ''
                },
            },
            readOnly: !_.isEmpty(crudTable.state.editingMultipleRecordsIds),
            index: 2,
        },
        ampPrimerReverseId: {
            label: 'AMP Primer Reverse',
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/amplification-primers`,
                searchFields: ['name'],
                valueField: 'id',
                displayFields: ['name'],
                searchWhereClause: {"and": [
                    {"==": [{"var": "sequenceType"}, "reverse"]},
                    {"==" : [ {"var":"targetId"}, crudTable.state.editingRecord?.snvLibCloningExperiment?.targetId] },
                ]},
                dropdown: true,
                inputClass: (data: any) => {
                    return data?.record?.archived ? 'line-through' : ''
                },
            },
            readOnly: !_.isEmpty(crudTable.state.editingMultipleRecordsIds),
            index: 3,
        },
        quant: {
            label: 'Quant (ng/µL)',
        },
        cleanedBy: {
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/users`,
                searchFields: ['name'],
                valueField: 'id',
                displayFields: ['name'],
                dropdown: true,
            }
        },
        sgeOligoId: {
            label: 'SGE Oligo',
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/sge-oligos`,
                searchFields: ['name'],
                valueField: 'id',
                displayFields: ['name'],
                dropdown: true,
                searchWhereClause: {"==" : [ {"var":"targetId"}, crudTable.state.editingRecord?.snvLibCloningExperiment?.targetId] },
            },
        },
    }
})
const displayWithClause = {
    cleanedBy: {
        columns: {id: true, name: true},
    },
    snvLibCloningExperiment: {
        columns: {id: true, name: true, targetId: true},
    },
    ampPrimerForward: {
        columns: {id: true, name: true, archived: true},
    },
    ampPrimerReverse: {
        columns: {id: true, name: true, archived: true},
    },
    sgeOligo: {
        columns: {id: true, name: true},
        with: {
            sgeOligoLots: {
                with: {
                    lot: {
                        columns: {id: true, lotNumber: true},
                    },
                },
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
                tableName="snv-lib-amp-products"
                schemaName="select"
                title="AMP products"
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
                tableName="snv-lib-amp-products"
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
                tableName="snv-lib-amp-products"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="snv-lib-amp-products"
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
