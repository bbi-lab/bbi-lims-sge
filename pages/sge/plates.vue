<script setup>
import _ from 'lodash'

const showAddForm = ref(false)
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const editingMultipleRecordsIds = ref([])
const editingRecordId = ref(null)
const platesTable = ref()
const router = useRouter()
const poolingPlates = ref([])

function didClickRecordEdit(event) {
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
function didClickMultipleRecordEdit(recordIds) {
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
function didAddRecord(event) {
    platesTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    platesTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    platesTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const columnDefs = {
    plateType: { display: false },
    pcrExperimentId: { display: false},
    sizeX: { display: false },
    sizeY: { display: false },
    wellsCount: { display: false },
    wellsWithContentCount: { display: false },
    filled: {
        format: (data) => {
            if (data.wellsCount - data.wellsWithContentCount) {
                return `${data.wellsWithContentCount} / ${data.wellsCount}`
            } else {
                return '-'
            }
        },
        path: 'filled.displayValue',
    }
}
const rowActions = {
    layout: {
        action: (data) => {
            router.push({path:`/sge/plate-diagram/${data.plateType}/${data.id}`})
        },
        disabled: ({plateType}) => !_.isEmpty(poolingPlates.value) || _.includes(['amp-pcr', 'lin-pcr', 'ha-pcr'], plateType)
    },
    pool: {
        action: ({id, name}) => {
            if (_.size(poolingPlates.value)==0) {
                poolingPlates.value = [{id, name}]
            } else if (_.size(poolingPlates.value)==1 && poolingPlates.value[0].id !== id) {
                poolingPlates.value.push({id, name})
                router.push({path: `/sge/plate-diagram/pool/${poolingPlates.value[0].id}/${poolingPlates.value[1].id}`})
            }
        },
        visible: ({plateType}) => _.includes(['preseq-1', 'preseq-2', 'preseq-3'], plateType),
        disabled: ({id, plateType}) => _.includes(poolingPlates.value.map(p => p.id), id) || _.size(poolingPlates.value) > 1
    }
}

const fieldDefs = {
    pcrExperimentId: { display: false },
    wells: { display: false }
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <div class="bg-red-100 p-5" v-if="_.size(poolingPlates) == 1">
                <span class="mr-5">Plate {{ poolingPlates[0].name}} is selected for pooling. Now select a plate to pool into.</span>
                <Button label="Cancel" severity="warn" @click="poolingPlates = []"/>
            </div>
            <QuickTable
                ref="platesTable"
                tableName="view-plates-with-well-counts"
                schemaName="select"
                title="Plates"
                :selectionDisabled="showAddForm || showEditForm || showMultipleEditForm"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
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
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="plates"
                schemaName="update"
                :fieldDefs="fieldDefs"
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
