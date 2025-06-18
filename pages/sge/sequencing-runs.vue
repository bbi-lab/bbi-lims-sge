
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import _ from 'lodash'
import { RecordService } from '~/utils/service/RecordService'

const crudTable = useCrudTable()
const config = useRuntimeConfig()
const router = useRouter()
const invalidRecords = ref()

onMounted(async () => {
    const sequencingRunErrors = _.map(
        await RecordService.getRecords(`${config.public.apiBase}/view-sequencing-run-errors`, {}),
        (x) => { return {id: x.id, messages: x.errorMessages} }
    )
    invalidRecords.value = _.mapValues(_.keyBy(sequencingRunErrors, 'id'), (x) => _.omit(x, 'id'))
})

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
        type: 'element',
        element: (x: any) => {
            const plates =  _.map(x.plates, 'name').join(', ')
            const href = !_.isEmpty(plates) ? `/sge/plates?sequencingRunName=${x.name}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${plates}</a>` : ''
        },
        elementSearchText: (x: any) => {
            return _.map(x.plates, 'name').join(', ')
        },
        exportValue: (x: any) => {
            return _.map(x.plates, 'name').join(', ')
        },
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
    },
    createdOn: {
        type: 'date'
    },
    startedOn: {
        type: 'date'
    },
    endedOn: {
        type: 'date'
    },
}
const rowActions = {
    contents: {
        label: '',
        action: (data: any) => {
            router.push({path:`/sge/sequencing-run/${data.id}/contents`})
        },
        icon: 'pi pi-fw pi-list',
        iconPos: 'right',
        tooltip: 'View contents',
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
