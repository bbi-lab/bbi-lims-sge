<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { v4 as uuidv4 } from 'uuid'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const crudTable = useCrudTable()
const whereClauses = ref()
const readonlyValues = ref<Record<string, any>>({})
const tableKey = ref()

watch(() => route.query, async (newValue, oldValue) => {
    whereClauses.value = queryParamsToJsonLogic(newValue)
    readonlyValues.value = getSimpleQueryParams(newValue)
    tableKey.value = uuidv4()
}, { immediate: true })

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
                    id: true,
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
                with: {
                    cycle: {
                        columns: {
                            name: true
                        }
                    }
                },
            }
        }
    },
    dna: {
        columns: {
            id: true
        },
    },
    rna: {
        columns: {
            id: true
        },
    },
    wellable: {
        with: {
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
        }
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
    dna: {
        header: 'DNA',
        index: 3,
        type: 'element',
        element: (x: any) => {
            const href = _.has(x, 'dna.id') ? `/sge/dna?pelletId=${x.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">✓</a>` : ''
        },
        exportValue: (x: any) => {
            return _.has(x, 'dna.id') ? 'true' : 'false'
        },
    },
    rna: {
        header: 'RNA',
        index: 4,
        type: 'element',
        element: (x: any) => {
            const href = _.has(x, 'rna.id') ? `/sge/rna?pelletId=${x.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">✓</a>` : ''
        },
        exportValue: (x: any) => {
            return _.has(x, 'rna.id') ? 'true' : 'false'
        },
    },
    transfectionExperiment: {
        path: 'transfectTarget.experiment.cycle.name',
        index: 5,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            return combinedWellLocations(x) as string
        },
        path: 'wellContents.displayValue',
        type: 'string',
        index: 6,
    },
    transfectTarget: {
        header: 'Target',
        format: (x: any) => { return _.get(x, 'transfectTarget.target.name') || `${_.get(x, 'transfectTarget.target.region.gene.symbol')} : ${_.get(x, 'transfectTarget.target.region.name')}`},
        path: 'transfectTarget.displayValue',
        type: 'string',
        index: 7,
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
        },
        readOnly: true,
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

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :key="tableKey"
                :ref="crudTable.setTableRef"
                tableName="pellets"
                title="Pellets"
                schemaName="select"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                :withClause="displayWithClause"
                :where="whereClauses?.[0]"
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
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="pellets"
                schemaName="update"
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
