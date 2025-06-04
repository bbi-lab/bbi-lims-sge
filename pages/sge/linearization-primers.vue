<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'

const config = useRuntimeConfig()
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref<string | null>(null)
const linearizationPrimersTable = ref()

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

function didAddRecord(event: any) {
    linearizationPrimersTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event: any) {
    linearizationPrimersTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event: any) {
    linearizationPrimersTable.value.removeRecordId(event.id)
    showEditForm.value = false
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
            }
        }
    },
    wellContents: {
        with: {
            well: {
                columns: {
                    id: true,
                    x: true,
                    y: true,
                },
                with: {
                    plate: {
                        columns: {
                            id: true,
                            name: true,
                            plateType: true,
                        }
                    }
                }
            },
        },
    },
})

const columnDefs: ColumnDefinitions = {
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
    wellContents: {
        header: 'Location',
        format: (x: any) => { return _.has(x, 'wellContents.well.plate') ? ` ${_.get(x, 'wellContents.well.plate.name')}: ${wellCoordinateToChar(x.wellContents?.well?.y)}${x.wellContents?.well?.x}` : ''},
        path: 'wellContents.displayValue',
        type: 'string',
        index: 5,
    },
}

const fieldDefs: FieldDefinitions = {
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
                v-if="editingRecordId && showEditForm"
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
