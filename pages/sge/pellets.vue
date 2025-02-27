<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const pelletsTable = ref()
const route = useRoute()
const queryParams = route.query
const config = useRuntimeConfig()
const tableTitle = ref(null)

onMounted(async() => {
    // if (queryParams.targetId) {
    //     const target = await RecordService.getRecord(`${config.public.apiBase}/targets`, queryParams.targetId)
    //     tableTitle.value = `${target.name}: regions`
    // } else {
    //     tableTitle.value = `All Regions`
    // }
})

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
    pelletsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    pelletsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    pelletsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}

const displayWithClause = Object.freeze({
    harvestedBy: {
        columns: {
            name: true
        },
    },
    transfectTargetId: {
        columns: {},
        with: {
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
            experiment: {
                columns: {
                    id: true,
                    name: true
                },
            }
        }
    },
    storageBoxId: {
        columns: {
            name: true,
        }
    }
})

const columnDefs = {
    experiment: {
        path: 'transfectTargetId.experiment.name',
        index: 0,
    },
    transfectTargetId: {
        header: 'Target',
        format: (x) => { return _.get(x, 'transfectTargetId.target.name') || `${_.get(x, 'transfectTargetId.target.region.gene.symbol')} : ${_.get(x, 'transfectTargetId.target.region.name')}`},
        path: 'transfectTargetId.displayValue',
        type: 'string',
        index: 1,
    },
    harvestedBy: {
        path: 'harvestedBy.name',
    },
    storageBoxId: {
        header: 'Storage',
        format: (x) => { return _.compact([_.get(x, 'storageBoxId.name', '') ,_.get(x, 'storageBoxLoc', '')]).join(': ')},
        path: 'storageBoxId.displayValue',
        type: 'string',
    },
    storageBoxLoc: {
        display: false
    },
}
const fieldDefs = {
    transfectTargetId: {
        label: 'Target',
        component: 'NestedSelect',
        props: {
            parentSearchBaseUrl: `${config.public.apiBase}/transfect-experiments`,
            parentSearchFields: ['name'],
            parentValueField: 'id',
            parentDisplayFields: ['name'],
            parentIftaLabel: 'Experiment',

            searchBaseUrl: `${config.public.apiBase}/transfect-targets`,
            searchFields: ['target.name', 'target.region.gene.symbol', 'target.region.name'],
            valueField: 'id',
            displayFormat: (x) => { return x.target?.name ?? `${x.target?.region?.gene?.symbol}:${x.target.region.name}`},
            parentKeyField: 'experimentId',
            searchWithClause: {
                target: {columns: {name: true}, with: {region: {columns: {name: true}, with: {gene: {columns: {symbol: true}}}}}},
            },
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
            dropdown: true,
        }
    },
    storageBoxLoc: {
        label: 'Storage box location'
    },
}

// convert query params in to JSON Logic to pass as where clause
// TODO - pass more than just the first to QuickTable
const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})
const defaultValues = queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="pelletsTable"
                tableName="pellets"
                title="Pellets"
                schemaName="select"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :where="whereClauses[0]"
                :title="tableTitle"
                :canAdd="false"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="pellets"
                schemaName="insert"
                :defaultValues="defaultValues"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="pellets"
                schemaName="update"
                :defaultValues="defaultValues"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
