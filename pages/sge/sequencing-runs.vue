
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import _ from 'lodash'

const crudTable = useCrudTable()
const config = useRuntimeConfig()

const columnDefs: ColumnDefinitions = {
    startedOn: {
        format: 'date-time'
    },
    createdOn: {
        format: 'date-time'
    },
    endedOn: {
        format: 'date-time'
    },
    plates: {
        format: (x: any) => _.map(x.plates, 'name'),
        path: 'plates.displayValue',
    }
}
const fieldDefs: FieldDefinitions = {
  'plates.*': {
        label: 'Plates',
        component: 'InputArray',
        canDelete: false,
        canUpdate: false,
        props: {
            components: [
                {
                    variableField: 'id',
                    label: 'Plate',
                    component: 'AutoCompleter',
                    componentProps: {
                        searchBaseUrl: `${config.public.apiBase}/plates`,
                        searchFields: ['name'],
                        searchWhereClause: { 'and': [{'==': [{'var': 'sequencingRunId'}, null]}, {'==': [{'var': 'plateType'}, 'preseq-3']}] },
                        valueField: 'id',
                        inputClass: 'w-64',
                        dropdown: true,
                    },
                },
            ]
        }
    }
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="sequencing-runs"
                schemaName="select"
                title="Sequencing runs"
                :columnDefs="columnDefs"
                :canEditMultiple="true"
                :withClause="{'plates': true}"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="sequencing-runs"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :values="{status: 'pending', createdOn: new Date()}"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="sequencing-runs"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="{'plates': true}"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
