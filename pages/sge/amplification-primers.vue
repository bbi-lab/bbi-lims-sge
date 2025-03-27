<script setup>
import _ from 'lodash'
import { numberToChar } from '~/composables/lib/plate-diagram'

const config = useRuntimeConfig()

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const amplificationPrimersTable = ref()
const showMultipleEditForm = ref(false)
const editingMultipleRecordsIds = ref([])

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

function didAddRecord(event) {
    amplificationPrimersTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    amplificationPrimersTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    amplificationPrimersTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
function didClickMultipleRecordEdit(recordIds) {
    editingMultipleRecordsIds.value = recordIds
    showMultipleEditForm.value = true
    showEditForm.value = false
    showAddForm.value = false
}
function didClickCancelMultipleEditForm() {
    editingMultipleRecordsIds.value = []
    showMultipleEditForm.value = false
}
function didUpdateMultipleRecords(event) {
    event.forEach(e => {
        if (e.id) amplificationPrimersTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
const displayWithClause = Object.freeze({
    target: {
        columns: {
            name: true
        },
        with: {
            project: {
                columns: {
                    name: true
                }
            },
            region: {
                columns: {
                    name: true
                },
                with: {
                    gene: {
                        columns: {
                            symbol: true
                        }
                    }
                }
            },
        },
    },
    storageBox: {
        columns: {
            name: true
        }
    },
    well: {
        columns: {
            x: true,
            y: true,
        },
        with: {
            plate: {
                columns: {
                    name: true
                }
            }
        }
    },
})

const columnDefs = {
    name: {
        index: 1
    },
    targetId: {
        header: 'Target',
        format: (x) => {
            return x.target?.name || (x.target?.region ? `${_.get(x, 'target.region.gene.symbol')} : ${_.get(x, 'target.region.name')}` : '')
        },
        path: 'targetId.displayValue',
        type: 'string',
        index: 2,
    },
    project: {
        format: (x) => {
            return x.target?.project?.name || ''
        },
        path: 'project.displayValue',
        index: 3,
    },
    storageBoxId: {
        header: 'Storage',
        format: (x) => { return _.compact([_.get(x, 'storageBox.name', '') ,_.get(x, 'storageBoxLoc', '')]).join(': ')},
        path: 'storageBoxId.displayValue',
        type: 'string',
        index: 4,
    },
    storageBoxLoc: {
        display: false
    },
    wellId: {
        header: 'Plate: Well',
        format: (x) => { return _.has(x, 'well.plate') ? ` ${_.get(x, 'well.plate.name')}: ${numberToChar(x.well?.y)}${x.well?.x}` : ''},
        path: 'wellId.displayValue',
        type: 'string',
        index: 5,
    },
}

const fieldDefs = {
    targetId: {
        label: 'Target',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/targets`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        }
    },
    storageBoxId: {
        label: 'Storage box',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/storage-boxes`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
        }
    },
    wellId: {
        label: 'Plate/Well',
        component: 'NestedSelect',
        props: {
            parentSearchBaseUrl: `${config.public.apiBase}/plates`,
            parentSearchFields: ['name'],
            parentValueField: 'id',
            parentDisplayFields: ['name'],
            parentIftaLabel: 'Plate',

            searchBaseUrl: `${config.public.apiBase}/wells`,
            searchFields: ['x', 'y'],
            valueField: 'id',
            displayFormat: (well) => { return `${numberToChar(well.y)}${well.x}`},
            parentKeyField: 'plateId',
        }
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="amplificationPrimersTable"
                tableName="amplification-primers"
                schemaName="select"
                title="Amplification Primers"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
                :canEditMultiple="true"
                :selectionDisabled="showAddForm || showEditForm || showMultipleEditForm"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
                @clickedMultipleRecordEdit="didClickMultipleRecordEdit"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm || showMultipleEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="amplification-primers"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="amplification-primers"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="amplification-primers"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
