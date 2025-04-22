<script setup lang="ts">
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref<string | undefined>()
const pelletsTable = ref()
const route = useRoute()
const config = useRuntimeConfig()
const tableTitle = ref<string>('Pellets')
const showMultipleEditForm = ref(false)
const editingMultipleRecordsIds = ref<string[]>([])

const queryParams = route.query

onMounted(async() => {
    if (_.has(queryParams, ['transfectTarget.experiment.id'])) {
        const tranfectExperiment = await RecordService.getRecord(`${config.public.apiBase}/transfect-experiments`, _.get(queryParams, ['transfectTarget.experiment.id']) as string, {})
        tableTitle.value = `${tranfectExperiment.name}: pellets`
    } else if (_.has(queryParams, ['extractionExperimentId'])) {
        const extractionExperiment = await RecordService.getRecord(`${config.public.apiBase}/extraction-experiments`, _.get(queryParams, ['extractionExperimentId']) as string, {})
        tableTitle.value = `${extractionExperiment.name}: pellets`
    }
})

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
    editingRecordId.value = undefined
    showEditForm.value = false
}

function didAddRecord(event: any) {
    pelletsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event: any) {
    pelletsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event: any) {
    pelletsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
function didClickMultipleRecordEdit(recordIds: string[]) {
    editingMultipleRecordsIds.value = recordIds
    showMultipleEditForm.value = true
    showEditForm.value = false
    showAddForm.value = false
}
function didClickCancelMultipleEditForm() {
    editingMultipleRecordsIds.value = []
    showMultipleEditForm.value = false
}
function didUpdateMultipleRecords(event: any[]) {
    event.forEach(e => {
        if (e.id) pelletsTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
const displayWithClause = Object.freeze({
    harvestedBy: {
        columns: {
            name: true
        },
    },
    transfectTarget: {
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
    storageBox: {
        columns: {
            name: true,
        }
    }
})

const columnDefs = {
    name: {
        index: 0,
    },
    transfectionExperiment: {
        path: 'transfectTarget.experiment.name',
        index: 1,
    },
    transfectTarget: {
        header: 'Target',
        format: (x: any) => { return _.get(x, 'transfectTarget.target.name') || `${_.get(x, 'transfectTarget.target.region.gene.symbol')} : ${_.get(x, 'transfectTarget.target.region.name')}`},
        path: 'transfectTarget.displayValue',
        type: 'string',
        index: 2,
    },
    transfectTargetId: {
        display: false,
    },
    harvestedBy: {
        path: 'harvestedBy.name',
    },
    storageBox: {
        header: 'Storage',
        format: (x: any) => { return _.compact([_.get(x, 'storageBoxId.name', '') ,_.get(x, 'storageBoxLoc', '')]).join(': ')},
        path: 'storageBoxId.displayValue',
        type: 'string',
    },
    storageBoxId: {
        display: false,
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
            displayFormat: (x:any) => { return x.target?.name ?? `${x.target?.region?.gene?.symbol}:${x.target.region.name}`},
            parentKeyField: 'experimentId',
            searchWithClause: {
                target: {columns: {name: true}, with: {region: {columns: {name: true}, with: {gene: {columns: {symbol: true}}}}}},
            },
        }
    },
    extractionExperimentId: {
        label: 'Extraction experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/extraction-experiments`,
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
            dropdown: true,
        }
    },
    storageBoxLoc: {
        label: 'Storage box location'
    },
    harvestedOn: {
        readOnly: true,
    },
    harvestDay: {
        readOnly: true,
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
                :title="tableTitle"
                schemaName="select"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :where="whereClauses[0]"
                :canAdd="false"
                :canEditMultiple="true"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                :selectionDisabled="showAddForm || showEditForm || showMultipleEditForm"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedMultipleRecordEdit="didClickMultipleRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm || showMultipleEditForm">
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
            <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="pellets"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
