<script setup lang="ts">
import { index } from 'd3'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'

const router = useRouter()
const crudTable = useCrudTable()
const config = useRuntimeConfig()

const columnDefs: ColumnDefinitions = {
    projectName: { index: 1 },
    sequencingRun: {
        format: (data: any) => {
            return data.sequencingRun?.name || ''
        },
        path: 'sequencingRun.displayValue',
        index: 3,
    },
    createdAt: { display: false },
    sequencingRunId: { display: false },
    externalSampleId: { header: 'Sample ID', index: 2},
    customIndexSeq1: { display: false },
    customIndexSeq2: { display: false },
    indexPrimer1Id: { display: false},
    indexPrimer2Id: { display: false},
    sourceWellId: { display: false },
    indexPrimer1: {
        format: (data: any) => {
            return data.indexPrimer1?.name || data.customIndexSeq1 || ''
        },
        path: 'indexPrimer1.displayValue',
        index: 4,
    },
    indexPrimer2: {
        format: (data: any) => {
            return data.indexPrimer2?.name || data.customIndexSeq2 || ''
        },
        path: 'indexPrimer2.displayValue',
        index: 5,
    }
}

const fieldDefs: FieldDefinitions = {
    sequencingRunId: {
        label: 'Sequencing Run',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/sequencing-runs`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 3,
    },
    createdAt: { display: false },
    projectName: { label: 'Project Name (sequencing)', index: 1},
    externalSampleId: { label: 'Sample ID', index: 2},
    customIndexSeq1: { label: 'Custom Index Sequence 1' },
    customIndexSeq2: { label: 'Custom Index Sequence 2' },
    indexPrimer1Id: {
        label: 'Index Primer 1',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/index-primers`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 4,
    },
    indexPrimer2Id: {
        label: 'Index Primer 2',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/index-primers`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 5,
    },
    sourceWellId: { display: false },
    millionReadsRequired: {
        props: {
            defaultValue: 5,
        },
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="sequencing-run-external-samples"
                schemaName="select"
                title="External samples"
                :withClause="{sequencingRun: true, indexPrimer1: true, indexPrimer2: true}"
                :columnDefs="columnDefs"
                :canEditMultiple="true"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="sequencing-run-external-samples"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="sequencing-run-external-samples"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="sequencing-run-external-samples"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
