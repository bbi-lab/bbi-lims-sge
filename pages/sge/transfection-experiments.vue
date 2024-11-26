<script setup>
import _ from 'lodash'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const transfectionExperimentsTable = ref()
const router = useRouter()
const config = useRuntimeConfig()

const rowActions = {}

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
    transfectionExperimentsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    transfectionExperimentsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    transfectionExperimentsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}


const editWithClause = Object.freeze({transfectionExperimentsTargets: {with: {target:  true}}})
const displayWithClause = Object.freeze({
    technician: {columns: {name: true}},
    transfectionExperimentsTargets:{
        columns: {},
        with: {
            target:  {
                columns: {
                    name: true,
                },
                with: {
                    region:{
                        columns: {name: true}, 
                        with: {
                            gene: {
                                columns: {symbol: true}
                            }
                        }
                    },
                }
            }
        }
    },
})

const columnDefs = {
    startedOn: {
        format: 'date-time'
    },
    technician: {
        format: (x) => _.get(x, 'technician.name'),
    },
    transfectionExperimentsTargets: {
        header: 'Targets',
    }
}

const fieldDefs = {
    'transfectionExperimentsTargets.*': {
        label: 'Targets',
        component: 'ManyToMany',
        props: {
            baseUrl: `${config.public.apiBase}/transfection-experiments-targets`,
            fixedValueField: 'transfectionExperimentId',
            variableField: 'targetId',
            component: 'AutoCompleter',
            componentProps: {
                searchBaseUrl: `${config.public.apiBase}/targets`,
                searchFields: ['region.gene.symbol', 'region.name', 'name'],
                valueField: 'id',
                displayFields: ['region.gene.symbol', 'region.name', 'name'],
                searchWithClause: {region: {columns: {name: true}, with: {gene: {columns: {symbol:true}}}}},
            },
        }
    },
}
</script>
<template>
    <Splitter>
        <SplitterPanel :size="50">
            <QuickTable
                ref="transfectionExperimentsTable"
                tableName="transfection-experiments"
                schemaName="select"
                title="Transfection experiments"
                :rowActions="rowActions"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="transfection-experiments"
                schemaName="insert"
                :fieldDefs="{transfectionExperimentsTargets: {display: false}}"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="transfection-experiments"
                schemaName="update"
                :withClause="editWithClause"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
