<script setup lang="ts">
import _ from 'lodash'
import type { PlateType } from '~/server/db/schema/sge/plate'

const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingMultipleRecordsIds = ref<string[]>([])
const editingRecordId = ref<string | null>(null)
const platesTable = ref()
const router = useRouter()
// const poolingPlates = ref<{id: string, name: string}[]>([])
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
    wellsCount: { display: false },
    wellsWithContentCount: { display: false },
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
    discarded: { index: 5 },
    processed: { index: 6 }
}
const rowActions = {
    layout: {
        action: (data: any) => {
            router.push({path:`/sge/plate-diagram/${data.plateType}/${data.id}`})
        },
        disabled: ({plateType}: { plateType: PlateType }) => _.includes(['amp-pcr', 'lin-pcr', 'ha-pcr'], plateType)
    },
    // pool: {
    //     action: ({id, name}: {id: string, name: string}) => {
    //         if (_.size(poolingPlates.value)==0) {
    //             poolingPlates.value = [{id, name}]
    //         } else if (_.size(poolingPlates.value)==1 && poolingPlates.value[0].id !== id) {
    //             poolingPlates.value.push({id, name})
    //             router.push({path: `/sge/plate-diagram/pool/${poolingPlates.value[0].id}/${poolingPlates.value[1].id}`})
    //         }
    //     },
    //     visible: ({plateType}: { plateType: PlateType }) => _.includes(['preseq-1', 'preseq-2', 'preseq-3'], plateType),
    //     disabled: ({id}: {id: string}) => _.includes(poolingPlates.value.map(p => p.id), id) || _.size(poolingPlates.value) > 1
    // }
}

const fieldDefs = {
    pcrExperimentId: { display: false },
    wells: { display: false },
    name: { index: 0 },
    plateType: {
        index: 1,
        onChange: (x: any) => {
            if (_.endsWith(x.plateType, '-storage')) {
                x.sizeX = 9
                x.sizeY = 9
            } else {
                x.sizeX = 12
                x.sizeY = 8
            }
        }
    },
}

const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})
const readonlyValues = queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <!-- <div class="bg-red-100 p-5" v-if="_.size(poolingPlates) == 1">
                <span class="mr-5">Plate {{ poolingPlates[0].name}} is selected for pooling. Now select a plate to pool into.</span>
                <Button label="Cancel" severity="warn" @click="poolingPlates = []"/>
            </div> -->
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
