
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import _ from 'lodash'

const crudTable = useCrudTable()
const router = useRouter()
const invalidRecords = ref()

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
    samples: {
        display: false,
    },
    externalSamples: {
        display: false,
    },
}
const fieldDefs: FieldDefinitions = {
    createdOn: {
        type: 'date'
    },
    startedOn: {
        type: 'date'
    },
    endedOn: {
        type: 'date'
    },
    samples: {
        display: false,
    },
}
const rowActions = {
    samples: {
        label: (data: any) => { return `${_.size(data.samples) + _.size(data.externalSamples)}`},
        action: (data: any) => {
            router.push({path:`/sge/sequencing-run/${data.id}/samples`})
        },
        icon: 'pi pi-fw pi-list',
        iconPos: 'right',
        tooltip: 'View samples',
    }
}
const didAddRecord = async (record: any) => {
    // await updateInvalidRecords()
    crudTable.didAddRecord(record)
}
const didUpdateRecord = async (record: any) => {
    // await updateInvalidRecords()
    crudTable.didUpdateRecord(record)
}
const didDeleteRecord = async (record: any) => {
    // await updateInvalidRecords()
    crudTable.didDeleteRecord(record)
}
const displayWithClause = {
    samples: {
        columns: {
            id: true,
        },
    },
    externalSamples: {
        columns: {
            id: true,
        },
    },
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
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm"
                :rowActions="rowActions"
                :withClause="displayWithClause"
                :invalidRecords="invalidRecords"
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
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="sequencing-runs"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
