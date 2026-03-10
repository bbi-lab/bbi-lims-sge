<script setup lang="ts">
import _ from 'lodash'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import type { extractionLotUsage } from '~/server/db/schema/sge/extraction-experiment'
import { nucleicAcids } from '~/server/db/schema/sge/nucleic-acid'
import BeakerOutline from '~icons/mdi/beaker-outline'
import Molecule from '~icons/mdi/molecule'

const router = useRouter()
const crudTable = useCrudTable()

const displayWithClause = Object.freeze({
    technician: {columns: {name: true}},
    extractionLotUsage: {columns: {},
        with: {
            lot:  {
                columns: {
                    lotNumber: true
                }
            },
        }
    },
    dna: {columns: {id: true}},
    rna: {columns: {id: true}},
})

const columnDefs: ColumnDefinitions = {
    extractedOn: {
        format: 'date-time'
    },
    technician: {
        path: 'technician.name'
    },
    dna: {
        display: false,
    },
    rna: {
        display: false,
    },
    extractionLotUsage: {
        header: 'Reagents',
        format: (x) => _.join(_.map(_.get(x, 'extractionLotUsage', []), (y) => {
            return  y.lot.lotNumber
        }), ', '),
        path: 'extractionLotUsage.displayValue',
        type: 'string',
    },
}

const rowActions = {
    dna: {
        label: (data: any) => { return `${_.size(data.dna)}`},
        action: (data: any) => {
            router.push({path:'/sge/dna', query: {'extractionExperimentId': data.id}})
        },
        iconComponent: Molecule,
        iconPos: 'right',
        tooltip: 'DNA',
    },
    rna: {
        label: (data: any) => { return `${_.size(data.rna)}`},
        action: (data: any) => {
            router.push({path:'/sge/rna', query: {'extractionExperimentId': data.id}})
        },
        iconComponent: Molecule,
        iconPos: 'right',
        tooltip: 'RNA',
    },
    reagents: {
        label: (data: any) => { return `${data.extractionLotUsage?.length || 0}`},
        action: (data: any) => {
            router.push({path:`/sge/extraction-experiment/${data.id}/lot-usage`})
        },
        iconComponent: BeakerOutline,
        iconPos: 'right',
        tooltip: 'Reagents',
    },
    extraction: {
        label: () => 'Extraction',
        action: (data: any) => {
            router.push({path:`/sge/extraction-experiment/${data.id}/extraction`})
        },
        severity: 'warn',
        icon: 'pi pi-bolt',
        iconPos: 'right',
    },
}
const fieldDefs = {
    extractedOn: {
        type: 'date'
    },
    dna: {
        display: false,
    },
    rna: {
        display: false,
    },
    extractionLotUsage: {
        display: false,
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="extraction-experiments"
                schemaName="select"
                title="Extraction experiments"
                :rowActions="rowActions"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="extraction-experiments"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="extraction-experiments"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
