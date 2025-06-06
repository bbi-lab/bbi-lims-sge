
<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'

const route = useRoute()
const config = useRuntimeConfig()
const crudTable = useCrudTable()

const queryParams = route.query

const displayWithClause = Object.freeze({
    extractionExperiment: {
        columns: {name: true}
    },
    pellet: {
        columns: {id: true, name: true, isBackup: true},
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
    pellet: {
        index: 1,
        type: 'element',
        element: (x: any) => {
            const href = `/sge/pellets?id=${x.pellet.id}`
            return `<a href="${href}" class="text-blue-500 hover:underline">${x.pellet.name}</a>`
        },
        elementSearchText: (x: any) => {
            return x.pellet.name
        },
    },
    pelletIsBackup: {
        path: 'pelletIsBackup.displayValue',
        header: 'Backup pellet',
        type: 'bool',
        format: (data: any) => {
            return data.pellet?.isBackup ? '✓' : ''
        },

        index: 2,
    },
    extractionExperiment: {
        path: 'extractionExperiment.name',
        index: 3,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => { return _.has(x, 'wellContents.well.plate') ? ` ${_.get(x, 'wellContents.well.plate.name')}: ${wellCoordinateToChar(x.wellContents?.well?.y)}${x.wellContents?.well?.x}` : ''},
        path: 'wellContents.displayValue',
        type: 'string',
        index: 4,
    },
    protocol: {
        index: 5,
    },
    extractionExperimentId: {
        display: false
    },
    pelletId: {
        display: false
    },
    dnaConcentration: {
        header: 'DNA conc (ng/μL)',
    },
    dnaVolume: {
        header: 'DNA vol (μL)',
    },
    dnaYield: {
        header: 'DNA yield (μg)',
    },
    rnaConcentration: {
        header: 'RNA conc (ng/μL)',
    },
    rnaVolume: {
        header: 'RNA vol (μL)',
    },
    rnaYield: {
        header: 'RNA yield (μg)',
    },
}
const fieldDefs: FieldDefinitions = {
    extractionExperimentId: {
        label: 'Experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/extraction-experiments`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
        }
    },
    pelletId: {
        label: 'Pellet',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/pellets`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name', 'isBackup'],
            displayFormat: (x: any) => x.isBackup ? `${x.name} (backup)` : x.name,
        }
    },
    dnaConcentration: {
        label: 'DNA concentration (ng/μL)',
    },
    dnaVolume: {
        label: 'DNA volume (μL)',
    },
    dnaYield: {
        label: 'DNA yield (μg)',
    },
    rnaConcentration: {
        label: 'RNA concentration (ng/μL)',
    },
    rnaVolume: {
        label: 'RNA volume (μL)',
    },
    rnaYield: {
        label: 'RNA yield (μg)',
    },
}
const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})
const readonlyValues = queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="nucleic-acids"
                schemaName="select"
                title="Nucleic Acids"
                :columnDefs="columnDefs"
                :where="whereClauses"
                :withClause="displayWithClause"
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
                tableName="nucleic-acids"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="nucleic-acids"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="nucleic-acids"
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
