
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'

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
        index: 1,
        path: 'sgRnaPlasmidTargets.displayValue',
    },
    sgRnaCloningExperiment: {
        header: 'sgRNA Cloning Experiment',
        format: (data: any) => {
            // each sgRNA plasmid should only be associated with one well and one cloning experiment
            return data.wellable?.wellContents?.[0]?.well.plate?.sgRnaCloningExperiments?.[0]?.name || ''
        },
        path: 'sgRnaCloningExperiment.displayValue',
        index: 2,
    },
    externalLink: {
        format: 'hyperlink',
        index: 3,
    },
    targetId: { display: false},
    wellContents: { display: false },
}
const fieldDefs: FieldDefinitions = {
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
    externalLink: {
        type: 'hyperlink',
    },
}
const displayWithClause = {
    sgRnaPlasmidTargets: {
        with: {
            target: {
                columns: {name: true, id: true},
                with: {
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
                        columns: {id: true, name: true},
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
                :withClause="{sgRnaCloningExperiment: true}"
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
