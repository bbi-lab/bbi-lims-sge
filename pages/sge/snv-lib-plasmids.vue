
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
    target: {
        path: 'target.name',
        type: 'string',
        index: 1,
    },
    project: {
        header: 'Project',
        path: 'target.project.name',
        type: 'string',
        index: 2,
    },
    snvLibCloningExperiment: {
        header: 'SNVlib Cloning Experiment',
        type: 'element',
        element: (data: any) => {
            const href = data.snvLibCloningExperiment ? `/sge/snv-lib-cloning-experiments?id=${data.snvLibCloningExperiment.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${data.snvLibCloningExperiment?.name}</a>` : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'snvLibCloningExperiment.name', '')
        },
        index: 3,
    },
    snvLibCloningExperimentId: { display: false},
    volume: {
        header: 'Volume (uL)',
        index: 4,
    },
    quant: {
        header: 'Quant (ng/uL)',
        index: 5,
    },
    clonedOn: {
        header: 'Cloned On',
        index: 6,
    },
    bacterialPlateImagesLink: {
        format: 'hyperlink',
        index: 7,
    },
    benchlingLink: {
        format: 'hyperlink',
        index: 8,
    },
    plasmidsaurusOrderId: {
        header: 'Plasmidsaurus Order ID',
        index: 9,
    },
    ngsVerificationStatus: {
        header: 'NGS Verification Status',
        index: 10,
    },
    targetId: { display: false},
}
const fieldDefs: FieldDefinitions = {
    targetId: {
        label: 'Target',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/targets`,
            searchFields: ['name', 'region.gene.symbol', 'region.name'],
            searchWithClause: {
                region: {columns: {name: true}, with: {gene: {columns: {symbol: true}}}},
            },
            valueField: 'id',
            displayFields: ['name', 'region.gene.symbol', 'region.name'],
        }
    },
    bacterialPlateImagesLink: {
        type: 'hyperlink',
    },
    benchlingLink: {
        type: 'hyperlink',
    },
    snvLibCloningExperimentId: {
        label: 'Experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/snv-lib-cloning-experiments`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
        }
    },
    volume: {
        label: 'Volume (uL)',
    },
    quant: {
        label: 'Quant (ng/uL)',
    },
    clonedOn: {
        type: 'date',
    },
    plasmidsaurusOrderId: {
        label: 'Plasmidsaurus Order ID',
    },
    ngsVerificationStatus: {
        label: 'NGS Verification Status',
    },
}
const displayWithClause = {
    target: {
        columns: {name: true},
        with: {
            project: {columns: {name: true}},
            region: {
                columns: {name: true},
                with: {
                    gene: {columns: {symbol: true}}
                }
            }
        }
    },
    snvLibCloningExperiment: {
        columns: {id: true, name: true},
    },
    // wellable: {
    //     with: {
    //         wellContents: {
    //             columns: {id: true, name: true},
    //             with: {
    //                 well: {
    //                     columns: {id: true, name: true},
    //                     with: {
    //                         plate: {
    //                             columns: {id: true, name: true},
    //                         }
    //                     }
    //                 }
    //             }
    //         },
    //     }
    // },
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="snv-lib-plasmids"
                schemaName="select"
                title="SNVlib Plasmids"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :where="whereClauses"
                :canEditMultiple="true"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="snv-lib-plasmids"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :withClause="{snvLibCloningExperiment: true}"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="snv-lib-plasmids"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="snv-lib-plasmids"
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
