
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import _ from 'lodash'
import { RecordService } from '~/utils/service/RecordService'

const crudTable = useCrudTable()
const config = useRuntimeConfig()
const router = useRouter()
const invalidRecords = ref()

// const updateInvalidRecords = async () => {
//     const sequencingRunErrors = _.map(
//         await RecordService.getRecords(`${config.public.apiBase}/view-sequencing-run-errors`, {}),
//         (x) => { return {id: x.id, messages: x.errorMessages} }
//     )
//     invalidRecords.value = _.mapValues(_.keyBy(sequencingRunErrors, 'id'), (x) => _.omit(x, 'id'))
// }
// onMounted(async () => {
//     updateInvalidRecords()
// })

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
        label: '',
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
