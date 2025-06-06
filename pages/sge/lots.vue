<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'

const config = useRuntimeConfig()
const crudTable = useCrudTable()

const columnDefs: ColumnDefinitions = {
    startedUseOn: {
        format: 'date-time'
    },
    endedUseOn: {
        format: 'date-time'
    },
    expiresOn: {
        format: 'date-time'
    },
    lotNumber: {
        index: 0,
    },
    reagent: {
        path: 'reagent.name',
        index: 1,
    },
    inHouse: {
        index: 2,
    },
    status: {
        index: 3,
    },
    concentration: {
        format: ({concentration, reagent}) => { return reagent.soluteUnit && reagent.volumeUnit ? `${concentration || '--'} ${reagent.soluteUnit}/${reagent.volumeUnit}` : ''},
        path: 'concentration.displayValue',
        type: 'string',
        index: 4,
    },
    startingVolume: {
        format: ({startingVolume, reagent}) => { return reagent.volumeUnit ? `${startingVolume || '--'} ${reagent.volumeUnit}` : ''},
        path: 'startingVolume.displayValue',
        type: 'string',
        index: 5,
    },
    remainingVolume: {
        format: ({remainingVolume, reagent}) => { return reagent.volumeUnit ? `${remainingVolume || '--'} ${reagent.volumeUnit}` : ''},
        path: 'remainingVolume.displayValue',
        type: 'string',
        index: 5,
    },
}

const fieldDefs: FieldDefinitions = {
    reagent: {
        label: 'Reagent',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/reagents`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
        }
    },
    concentration: {
        label: (_data, relatedData) => {
            if (_.isObject(relatedData?.reagent)) {
                return `Concentration (${_.get(relatedData.reagent, 'soluteUnit')}/${_.get(relatedData.reagent, 'volumeUnit')})`
            } else {
                return 'Concentration'
            }
        }
    },
    startingVolume: {
        label: (_data, relatedData) => {
            if (_.isObject(relatedData?.reagent)) {
                return `Starting Volume (${_.get(relatedData.reagent, 'volumeUnit')})`
            } else {
                return 'Starting Volume'
            }
        }
    },
    remainingVolume: {
        label: (_data, relatedData) => {
            if (_.isObject(relatedData?.reagent)) {
                return `Remaining Volume (${_.get(relatedData.reagent, 'volumeUnit')})`
            } else {
                return 'Remaining Volume'
            }
        }
    }
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="lots"
                schemaName="select"
                title="Lots"
                :columnDefs="columnDefs"
                :withClause="{reagent: true}"
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
                tableName="lots"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :withClause="{reagent: true}"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="lots"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="{reagent: true}"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="lots"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
