
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import { wellCoordinateToChar } from '~/lib/plate-diagram'

const config = useRuntimeConfig()
const crudTable = useCrudTable()
const route = useRoute()

const tableKey = ref<string>(uuidv4())
const whereClauses = ref()
const readonlyValues = ref<Record<string, any>>({})

watch(() => route.query, async (newValue, oldValue) => {
    whereClauses.value = queryParamsToJsonLogic(newValue)
    readonlyValues.value = getSimpleQueryParams(newValue)
    tableKey.value = uuidv4()
}, { immediate: true })

const columnDefs = {
    name: {
        index: 0,
    },
    sgRnaPlasmidTargets: {
        header: 'Targets',
        format: (data: any) => {
            return _.map(data.sgRnaPlasmidTargets, 'target.name')
        },
        index: 2,
        path: 'sgRnaPlasmidTargets.displayValue',
    },
    project: {
        header: 'Project',
        format: (data: any) => {
            return _.join(_.uniq(_.compact(_.map(data.sgRnaPlasmidTargets, 'target.project.name'))), ',')
        },
        index: 3,
        path: 'project.displayValue',
    },
    plateWellLocation: {
        header: 'Plate: Well Location',
        format: (data: any) => {
            return _.map(data.wellable?.wellContents || [], (wellContent: any) => {
                const well = wellContent.well
                return `${well.plate.name}: ${wellCoordinateToChar(well.y)}${well.x}`
            }).join(', ')
        },
        path: 'plateWellLocation.displayValue',
        index: 5,
    },
    sgRnaCloningExperiment: {
        header: 'sgRNA Cloning Experiment',
        format: (data: any) => {
            return _.uniq(_.compact(_.flatMap(data.wellable?.wellContents || [], (wellContent: any) => {
                return _.map(wellContent.well?.plate?.sgRnaCloningExperiments, 'name')
            }))).join(', ')
        },
        path: 'sgRnaCloningExperiment.displayValue',
        index: 4,
    },
    benchlingLink: {
        format: 'hyperlink',
        index: 6,
    },
    genewizOrderNumber: {
        header: 'GeneWiz Order Number',
    },
    targetId: { display: false},
    wellContents: { display: false },
    status: {
        type: 'element',
        element: (data: any) => recordStatusTag(data.status),
        // format sets status.displayValue, which the column sorts, searches and exports on
        format: (data: any) => recordStatusLabel(data.status),
        path: 'status.displayValue',
        index: 1,
    },
}
const fieldDefs: FieldDefinitions = {
    name: {
        index: 0,
    },
    status: {
        index: 1,
    },
    'sgRnaPlasmidTargets.*': {
        label: 'Targets',
        component: 'InputArray',
        canDelete: true,
        canUpdate: true,
        props: {
            components: [
                {
                    variableField: 'targetId',
                    label: 'Target',
                    component: 'AutoCompleter',
                    componentProps: {
                        searchBaseUrl: `${config.public.apiBase}/targets`,
                        searchFields: ['name'],
                        valueField: 'id',
                        displayFields: ['name'],
                        dropdown: true,
                    },
                },
            ]
        },
    },
    benchlingLink: {
        type: 'hyperlink',
    },
    genewizOrderNumber: {
        label: 'GeneWiz Order Number',
    },
    clonedOn: {
        type: 'date',
    },
}
const displayWithClause = {
    sgRnaPlasmidTargets: {
        with: {
            target: {
                columns: {name: true, id: true},
                with: {
                    project: {columns: {name: true}},
                    region: {
                        columns: {name: true},
                        with: {
                            gene: {columns: {symbol: true}}
                        }
                    }
                }
            }
        }
    },
    wellable: {
        with: {
            wellContents: {
                columns: {id: true, name: true},
                with: {
                    well: {
                        columns: {id: true, name: true, x: true, y: true},
                        with: {
                            plate: {
                                columns: {id: true, name: true},
                                with: {
                                    sgRnaCloningExperiments: {columns: {id: true, name: true}}
                                }
                            }
                        }
                    }
                }
            },
        }
    },
}

const editWithClause = {
    sgRnaPlasmidTargets: {
        with: {
            target: {
                columns: {id: true, name: true},
            }
        }
     },
}
const rowActions = {}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="sg-rna-plasmids"
                schemaName="select"
                title="sgRNA Plasmids"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :where="whereClauses"
                :canEditMultiple="true"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="sg-rna-plasmids"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="sg-rna-plasmids"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                :withClause="editWithClause"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="sg-rna-plasmids"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
