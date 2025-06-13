<script setup lang="ts">
import _ from 'lodash'

const crudTable = useCrudTable()

const rowActions = {}

const columnDefs = {
    startedOn: {
        format: 'date-time'
    },
    technician: {
        path: 'technician.name',
    }
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="plasmid-experiments"
                schemaName="select"
                title="Plasmid experiments"
                :rowActions="rowActions"
                :withClause="{technician: {columns: {name: true}}}"
                :columnDefs="columnDefs"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="plasmid-experiments"
                schemaName="insert"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="plasmid-experiments"
                schemaName="update"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
