<script setup lang="ts">
import { index } from 'd3'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'

const router = useRouter()
const crudTable = useCrudTable()
const config = useRuntimeConfig()

const columnDefs: ColumnDefinitions = {
    wellContents: { display: false },
    sequencingRuns: { display: false },
    createdAt: { display: false },
    createdBy: { display: false },
    customIndexSeq1: {
        header: 'Custom Index Sequence 1'
    },
    customIndexSeq2: {
        header: 'Custom Index Sequence 2'
    },
}

const fieldDefs: FieldDefinitions = {
    wellContents: { display: false },
    sequencingRuns: { display: false },
    createdBy: { display: false },
    customIndexSeq1: {
        label: 'Custom Index Sequence 1'
    },
    customIndexSeq2: {
        label: 'Custom Index Sequence 2'
    },
}

const withClause = {
    sequencingRuns: true,
    // sourceWell: {
    //     with: {
    //         plate: true
    //     }
    // },
    // indexPrimer1: true,
    // indexPrimer2: true
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="external-samples"
                schemaName="select"
                title="External samples"
                :withClause="withClause"
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
                tableName="external-samples"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="external-samples"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="external-samples"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
