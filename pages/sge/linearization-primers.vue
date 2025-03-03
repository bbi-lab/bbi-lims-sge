<script setup>
import _ from 'lodash'

const config = useRuntimeConfig()
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const linearizationPrimersTable = ref()

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
    linearizationPrimersTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    linearizationPrimersTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    linearizationPrimersTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
const displayWithClause = Object.freeze({
    target: {
        columns: {
            name: true
        },
        with: {
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
        format: (x) => { return _.get(x, 'target.name') || `${_.get(x, 'target.region.gene.symbol')} : ${_.get(x, 'target.region.name')}`},
        path: 'targetId.displayValue',
        type: 'string',
        index: 2,
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
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="linearizationPrimersTable"
                tableName="linearization-primers"
                schemaName="select"
                title="Linearization Primers"
                :with-clause="displayWithClause"
                :columnDefs="columnDefs"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="linearization-primers"
                schemaName="insert"
                :field-defs="fieldDefs"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="linearization-primers"
                schemaName="update"
                :field-defs="fieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
