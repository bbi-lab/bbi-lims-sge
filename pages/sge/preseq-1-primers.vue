<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'
import { v4 as uuidv4 } from 'uuid'

const config = useRuntimeConfig()
const crudTable = useCrudTable()
const route = useRoute()

const tableKey = ref<string>(uuidv4())
const whereClauses = ref()
const readonlyValues = ref<Record<string, any>>({})

watch(() => route.query, async (newValue, oldValue) => {
    const queryParamFilters = _.map(newValue, (val, key) => {
        return {"==": [{"var": key}, val] }
    })
    whereClauses.value = _.size(queryParamFilters) > 1 ? {and: queryParamFilters} : queryParamFilters
    readonlyValues.value = newValue
    tableKey.value = uuidv4()
}, { immediate: true })

const displayWithClause = Object.freeze({
    preseq1PrimerTargets: {
        columns: {},
        with: {
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
                },
            },
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
    }
})

const columnDefs = {
    name: {
        index: 1
    },
    preseq1PrimerTargets: {
        header: 'Target(s)',
        format: (x: any) => {
            return _.map(x.preseq1PrimerTargets, 'target.name')
        },
        path: 'preseq1PrimerTargets.displayValue',
        index: 2,
        exportValue: (x: any) => {
            return _.map(x.preseq1PrimerTargets, 'target.name').join(', ')
        },
    },
    projects: {
        header: 'Project(s)',
        format: (x: any) => {
            return _.uniq(_.map(x.preseq1PrimerTargets, 'target.project.name')).join(', ')
        },
        path: 'projects.displayValue',
        index: 3,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            // return _.has(x, 'wellContents.well.plate') ? ` ${_.get(x, 'wellContents.well.plate.name')}: ${wellCoordinateToChar(x.wellContents?.well?.y)}${x.wellContents?.well?.x}` : ''
            if (!_.isEmpty(x?.wellable?.wellContents)) {
                return _.map(x.wellable.wellContents, (wellContent) => {
                    return `${_.get(wellContent, 'well.plate.name')}: ${wellCoordinateToChar(wellContent?.well?.y)}${wellContent?.well?.x}`
                }).join(', ')
            } else {
                return ''
            }
        },
        path: 'wellContents.displayValue',
        type: 'string',
        index: 5,
    },
}

const fieldDefs: FieldDefinitions = {
    'preseq1PrimerTargets.*': {
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
        }
    },
}
const formWithClause = {
    preseq1PrimerTargets: {
        columns: {
            id: true,
            targetId: true,
        },
        with: {
            target: {
                columns: {
                    name: true
                },
            },
        },
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :key="tableKey"
                :ref="crudTable.setTableRef"
                tableName="preseq-1-primers"
                schemaName="select"
                title="PreSeq 1 Primers"
                :withClause="displayWithClause"
                :where="whereClauses"
                :columnDefs="columnDefs"
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
                tableName="preseq-1-primers"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="preseq-1-primers"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                :withClause="formWithClause"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="preseq-1-primers"
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
