<script setup lang="ts">
import _ from 'lodash'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'

const crudTable = useCrudTable()

const rowActions = {}

const columnDefs: ColumnDefinitions = {
    name: {
        index: 0,
    },
    concentrationUnit: {
        format: ({soluteUnit, volumeUnit}: {soluteUnit: string, volumeUnit: string}) => { return soluteUnit && volumeUnit ? `${soluteUnit}/${volumeUnit}` : ''},
        path: 'concentrationUnit.displayValue',
        type: 'string',
        index: 1,
    },
    soluteUnit: {
        display: false,
    },
    volumeUnit: {
        display: false,
    }
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="reagents"
                schemaName="select"
                title="Reagents"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="reagents"
                schemaName="insert"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="reagents"
                schemaName="update"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
