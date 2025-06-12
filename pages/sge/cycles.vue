<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import IconParkSolidExperiment from '~icons/icon-park-solid/experiment'

const router = useRouter()
const crudTable = useCrudTable()

const columnDefs: ColumnDefinitions = {
    startedOn: {
        format: 'date-time'
    },
    endedOn: {
        format: 'date-time'
    },
    transfectionExperiments: {
        display: false,
    }
}
const rowActions = {
    targets: {
        label: (data: any) => { return `${data.transfectionExperiments?.length || 0}`},
        action: (data: any) => {
            router.push({path:'/sge/transfect-experiments', query: {'cycleId': data.id}})
        },
        iconComponent: IconParkSolidExperiment,
        iconPos: 'right',
        tooltip: 'Transfection experiments',
    }
}
const fieldDefs: FieldDefinitions = {
    transfectionExperiments: {
        display: false,
    }
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="cycles"
                schemaName="select"
                title="SGE Cycles"
                :rowActions="rowActions"
                :withClause="{transfectionExperiments: true}"
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
                tableName="cycles"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="cycles"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="cycles"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
