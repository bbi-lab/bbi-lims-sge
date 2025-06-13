<script setup lang="ts">
import _ from 'lodash'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
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
    nucleicAcids: {columns: {id: true}},
})

const columnDefs: ColumnDefinitions = {
    extractedOn: {
        format: 'date-time'
    },
    technician: {
        path: 'technician.name'
    },
    nucleicAcids: {
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
    nucleicAcids: {
        label: (data: any) => { return `${_.size(data.nucleicAcids)}`},
        action: (data: any) => {
            router.push({path:'/sge/nucleic-acids', query: {'extractionExperimentId': data.id}})
        },
        iconComponent: Molecule,
        iconPos: 'right',
        tooltip: 'Nucleic acids',
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
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="extraction-experiments"
                schemaName="update"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
