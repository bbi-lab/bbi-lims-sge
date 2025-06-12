<script setup lang="ts">
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const crudTable = useCrudTable()

const tableTitle = ref<string>('Pellets')
const queryParams = route.query

onMounted(async() => {
    if (_.has(queryParams, ['transfectTarget.experiment.id'])) {
        const tranfectExperiment = await RecordService.getRecord(`${config.public.apiBase}/transfect-experiments`, _.get(queryParams, ['transfectTarget.experiment.id']) as string, {cycle: {columns: {name: true}}})
        tableTitle.value = `${tranfectExperiment.cycle.name}: pellets`
    } else if (_.has(queryParams, ['extractionExperimentId'])) {
        const extractionExperiment = await RecordService.getRecord(`${config.public.apiBase}/extraction-experiments`, _.get(queryParams, ['extractionExperimentId']) as string, {})
        tableTitle.value = `${extractionExperiment.name}: pellets`
    }
})

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
    nucleicAcid: {
        columns: {
            id: true
        },
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
        index: 0,
    },
    isBackup: {
        index: 1,
    },
    isCurrent: {
        index: 2,
    },
    nucleicAcid: {
        header: 'Nucleic Acid',
        index: 3,
        type: 'element',
        element: (x: any) => {
            const href = _.has(x, 'nucleicAcid.id') ? `/sge/nucleic-acids?pelletId=${x.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">✓</a>` : ''
        },
        exportValue: (x: any) => {
            return _.has(x, 'nucleicAcid.id') ? 'true' : 'false'
        },
    },
    transfectionExperiment: {
        path: 'transfectTarget.experiment.name',
        index: 4,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => { return _.has(x, 'wellContents.well.plate') ? ` ${_.get(x, 'wellContents.well.plate.name')}: ${wellCoordinateToChar(x.wellContents?.well?.y)}${x.wellContents?.well?.x}` : ''},
        path: 'wellContents.displayValue',
        type: 'string',
        index: 5,
    },
    transfectTarget: {
        header: 'Target',
        format: (x: any) => { return _.get(x, 'transfectTarget.target.name') || `${_.get(x, 'transfectTarget.target.region.gene.symbol')} : ${_.get(x, 'transfectTarget.target.region.name')}`},
        path: 'transfectTarget.displayValue',
        type: 'string',
        index: 6,
    },
    transfectTargetId: {
        display: false,
    },
    harvestedBy: {
        path: 'harvestedBy.name',
    },
}
const rowActions = {
    summary: {
        label: '',
        action: (data: any) => {
            router.push({path:`/sge/pellet/summary/${data.id}`})
        },
        icon: 'pi pi-info-circle',
        tooltip: 'Pellet summary',
    }
}
const fieldDefs: FieldDefinitions = {
    transfectTargetId: {
        label: 'Target',
        component: 'NestedSelect',
        props: {
            parentSearchBaseUrl: `${config.public.apiBase}/transfect-experiments`,
            parentSearchFields: ['cycle.name'],
            parentValueField: 'id',
            parentDisplayFields: ['cycle.name'],
            parentIftaLabel: 'Experiment',
            parentSearchWithClause: {
                cycle: {columns: {name: true}},
            },

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
const readonlyValues = queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="pellets"
                :title="tableTitle"
                schemaName="select"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                :withClause="displayWithClause"
                :where="whereClauses[0]"
                :canAdd="false"
                :canEditMultiple="true"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="pellets"
                schemaName="insert"
                :readonlyValues="readonlyValues"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="pellets"
                schemaName="update"
                :readonlyValues="readonlyValues"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="pellets"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
