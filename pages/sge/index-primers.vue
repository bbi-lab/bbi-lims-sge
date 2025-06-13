<script setup lang="ts">
import _ from 'lodash'

const crudTable = useCrudTable()
const rowActions = {}

const columnDefs = {
    wellContents:{ display: false }
}
const fieldDefs = {
    wellContents:{ display: false }
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="index-primers"
                schemaName="select"
                title="Index Primers"
                :rowActions="rowActions"
                :columnDefs="columnDefs"
                :can-edit="false"
                :can-delete="false"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="index-primers"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
