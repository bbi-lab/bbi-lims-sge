<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'

const router = useRouter()
const crudTable = useCrudTable()
const config = useRuntimeConfig()

const columnDefs: ColumnDefinitions = {
    sequencingRun: {
        format: (data: any) => {
            return data.sequencingRun?.name || ''
        },
        path: 'sequencingRun.displayValue',
        index: 1,
    },
    createdAt: { display: false },
    sequencingRunId: { display: false },
    nucleicAcidId: { display: false},
    indexPrimer1Id:  { display: false},
    indexPrimer2Id:  { display: false},
    sourceWellId: { display: false },
    sampleName: {
        header: 'Sample Name',
        format: (data: any) => {
            return data.nucleicAcid?.pellet?.name || ''
        },
        path: 'sampleName.displayValue',
        index: 2,
    },
    sourcePlate: {
        header: 'Source Plate',
        path: 'sourceWell.plate.name',
        index: 3,
    },
    sourceWell: {
        header: 'Source Well',
        format: (data: any) => {
            return wellCoordinateToChar(data.sourceWell?.y) + data.sourceWell?.x
        },
        path: 'sourceWell.displayValue',
        index: 4,
    },
}
const fieldDefs: FieldDefinitions = {
    sequencingRunId: {
        label: 'Sequencing Run',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/sequencing-runs`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 3,
    },
    nucleicAcidId: {
        label: 'Sample name',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/nucleic-acids`,
            searchFields: ['pellet.name'],
            valueField: 'id',
            displayFields: ['pellet.name'],
            searchWithClause: {
                pellet: true,
            },
            dropdown: true,
        },
        readOnly: true,
        index: 1,
    },
    createdAt: { display: false },
    indexPrimer1Id: { display: false },
    indexPrimer2Id: { display: false },
    sourceWellId: { display: false },
    millionReadsRequired: {
        props: {
            defaultValue: 5,
        },
    },
}

const withClause = {
    sequencingRun: true,
    indexPrimer1: true,
    indexPrimer2: true,
    dna: {
        with: {
            pellet: true,
        }
    },
    sourceWell: {
        with: {
            plate: true,
            wellContents: {
                with: {
                    well: {
                        with: {
                            plate: true,
                        }
                    },
                    // wellContentSources: {
                    //     with: {
                    //         sourceWell: {
                    //             columns: {},
                    //             with: {
                    //                 plate: {
                    //                     columns: {
                    //                         id: true,
                    //                     }
                    //                 }
                    //             }
                    //         },
                    //     },
                    // },
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
                tableName="sequencing-run-samples"
                schemaName="select"
                title="Internal samples"
                :withClause="withClause"
                :columnDefs="columnDefs"
                :canEditMultiple="true"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="sequencing-run-samples"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="sequencing-run-samples"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="sequencing-run-samples"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
