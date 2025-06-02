<script setup lang="ts">
import _ from 'lodash'
import { ENUM_LOOKUPS } from '~/server/db/schema/sge/enum-lookups'
import type { PlateType } from '~/server/db/schema/sge/plate'

const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingMultipleRecordsIds = ref<string[]>([])
const editingRecordId = ref<string | null>(null)
const platesTable = ref()
const router = useRouter()
const route = useRoute()

const queryParams = route.query

function didClickRecordEdit(event: any) {
    editingRecordId.value = event.id
    showEditForm.value = true
    showAddForm.value = false
}

function didClickRecordAdd() {
    showAddForm.value = true
    showEditForm.value = false
}
function didClickCancelAddForm() {
    showAddForm.value = false
}
function didClickCancelEditForm() {
    editingRecordId.value = null
    showEditForm.value = false
}
function didClickMultipleRecordEdit(recordIds: string[]) {
    editingMultipleRecordsIds.value = recordIds
    showMultipleEditForm.value = true
    showEditForm.value = false
    showAddForm.value = false
}
// function didClickCancelMultipleEditForm() {
//     editingMultipleRecordsIds.value = []
//     showMultipleEditForm.value = false
// }
// function didUpdateMultipleRecords(event) {
//     event.forEach(e => {
//         if (e.id) platesTable.value.addOrRefreshRecordId(e.id)
//     })
//     showMultipleEditForm.value = false
// }
function didAddRecord(event: any) {
    platesTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event: any) {
    platesTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event: any) {
    platesTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs = {
    name: { index: 0},
    plateType: { display: false },
    plateTypeLabel: { header: 'Type', index: 1 },
    pcrExperimentId: { display: false},
    sizeX: { display: false },
    sizeY: { display: false },
    cycleId: { display: false },
    cycleName: { header: 'Cycle', index: 2 },
    targets: { index: 4 },
    wellsCount: { display: false },
    wellsWithContentCount: { display: false },
    wellsProcessedCount: { display: false },
    filled: {
        index: 3,
        format: (data: any) => {
            if (_.isNumber(data.wellsCount) && data.wellsCount > 0 && _.isNumber(data.wellsWithContentCount)) {
                return `${data.wellsWithContentCount} / ${data.wellsCount}`
            } else {
                return '-'
            }
        },
        path: 'filled.displayValue',
    },
    wellsProcessed: {
        header: 'Wells processed',
        index: 3,
        format: (data: any) => {
            return data.plateType == 'preseq-1' ? data.wellsProcessedCount : ''
        },
        path: 'wellsProcessed.displayValue',
    },
    discarded: { index: 5 },
    processed: { header: 'Plate processed', index: 6 }
}
const rowActions = {
    layout: {
        action: (data: any) => {
            router.push({path:`/sge/plate-diagram/${data.plateType}/${data.id}`})
        },
        disabled: ({plateType}: { plateType: PlateType }) => _.includes(['amp-pcr', 'lin-pcr', 'ha-pcr'], plateType)
    },
}

const fieldDefs = {
    pcrExperimentId: { display: false },
    wells: { display: false },
    name: { index: 0 },
    plateType: {
        index: 1,
        component: 'Select',
        props: {
            options: _.map(ENUM_LOOKUPS.plates.plateType, (value, key) => {
                if (key === 'preseq-1' || key === 'preseq-2' || key === 'preseq-3') {
                    return { label: value.label, code: key, disabled: true }
                } else {
                    return { label: value.label, code: key }
                }
            }),
            optionLabel: 'label',
            optionValue: 'code',
            optionDisabled: 'disabled',
        },
        events: {
            change: (record: any) => {
                if (_.endsWith(record.plateType, '-storage')) {
                    record.sizeX = 9
                    record.sizeY = 9
                } else {
                    record.sizeX = 12
                    record.sizeY = 8
                }
            }
        },
    },
}

const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})
const readonlyValues = queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="platesTable"
                tableName="view-plates-with-well-counts"
                schemaName="select"
                title="Plates/Storage boxes"
                :selectionDisabled="showAddForm || showEditForm || showMultipleEditForm"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                :where="whereClauses"
                :canDelete="false"
                :showColumnFilters="true"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedMultipleRecordEdit="didClickMultipleRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm || showMultipleEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="plates"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="editingRecordId && showEditForm"
                :recordId="editingRecordId"
                tableName="plates"
                schemaName="update"
                :fieldDefs="{...fieldDefs, plateType: {readOnly: true, index: 1}, sizeX: {readOnly: true}, sizeY: {readOnly: true}}"
                :readonlyValues="readonlyValues"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
            <!-- <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="plates"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            /> -->
        </SplitterPanel>
    </Splitter>
</template>
