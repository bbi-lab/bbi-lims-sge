
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
    const queryParamFilters = _.map(newValue, (val, key) => {
        return {"==": [{"var": key}, val] }
    })
    whereClauses.value = _.size(queryParamFilters) > 1 ? {and: queryParamFilters} : queryParamFilters
    readonlyValues.value = newValue
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
    linPrimers: {
        header: 'LIN Primers',
        type: 'element',
        element: (data: any) => {
            return _.compact(_.map([data.linPrimerForward, data.linPrimerReverse], (primer: any) => {
                return primer?.id ? `<span class="${primer?.archived ? 'line-through' : ''}">${primer.name}</span>` : null
            })).join(', ')
        },
        exportValue: (data: any) => {
            return _.compact([data.linPrimerForward?.name, data.linPrimerReverse?.name]).join(', ')
        },
        path: 'linPrimers.displayValue',
        index: 2,
    },
    haPuc19PlasmidId: { display: false },
    haPuc19Plasmid: {
        header: 'HA pUC19 Plasmid',
        path: 'haPuc19Plasmid.name',
        index: 3,
    },
    snvLibCloningExperimentId: { display: false },
    linPrimerForwardId: { display: false },
    linPrimerReverseId: { display: false },
    quant: {
        header: 'Quant (ng/µL)',
    },
    dpn1DigestBy: {
        header: 'DpnI Digest By',
        path: 'dpn1DigestBy.name'
    },
    dpn1DigestOn: {
        header: 'DpnI Digest On',
    },
    gelExtractedBy: {
        path: 'gelExtractedBy.name'
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
        linPrimerForwardId: {
            label: 'LIN Primer Forward',
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/linlification-primers`,
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
        linPrimerReverseId: {
            label: 'LIN Primer Reverse',
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/linlification-primers`,
                searchFields: ['name'],
                valueField: 'id',
                displayFields: ['name'],
                searchWhereClause: {"and": [
                    {"==": [{"var": "sequenceType"}, "reverse"]},
                    {"==" : [ {"var":"targetId"}, crudTable.state.editingRecord?.snvLibCloningExperiment?.targetId ]},
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
        haPuc19PlasmidId: {
            label: 'HA pUC19 Plasmid',
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/ha-puc-19-plasmids`,
                searchFields: ['name'],
                valueField: 'id',
                displayFields: ['name'],
                dropdown: true,
            },
        },
        dpn1DigestBy: {
            component: 'AutoCompleter',
            props: {
                searchBaseUrl: `${config.public.apiBase}/users`,
                searchFields: ['name'],
                valueField: 'id',
                displayFields: ['name'],
                dropdown: true,
            }
        },
        gelExtractedBy: {
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
})
const displayWithClause = {
    dpn1DigestBy: {
        columns: {id: true, name: true},
    },
    gelExtractedBy: {
        columns: {id: true, name: true},
    },
    snvLibCloningExperiment: {
        columns: {id: true, name: true},
    },
    linPrimerForward: {
        columns: {id: true, name: true, archived: true},
    },
    linPrimerReverse: {
        columns: {id: true, name: true, archived: true},
    },
    haPuc19Plasmid: {
        columns: {id: true, name: true},
    },
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="snv-lib-lin-products"
                schemaName="select"
                title="LIN products"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :where="whereClauses"
                :canEditMultiple="true"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                sortField="name"
                :sortOrder="1"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="snv-lib-lin-products"
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
                tableName="snv-lib-lin-products"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="snv-lib-lin-products"
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
