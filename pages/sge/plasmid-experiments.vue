<script setup lang="ts">
import _ from 'lodash'
import { ENUM_LOOKUPS } from '~/server/db/schema/sge/enum-lookups'

const crudTable = useCrudTable()
const router = useRouter()

const rowActions = {
    plates: {
        label: (data: any) => {
            const plateCount = data.plates?.length || 0
            const snvLibCount = data.snvLibs?.length || 0
            return `${plateCount} plate${plateCount > 1 ? 's' : ''} ▪ ${snvLibCount} SNV-lib${snvLibCount > 1 ? 's' : ''}`},  // for this to work, we need to expand plates
        action: (data: any) => {
            router.push({path:`/sge/plasmid-experiment/sg-rna/${data.id}`})
        },
        tooltip: 'Plates',
    }
}
const columnDefs = {
    startedOn: {
        format: 'date-time'
    },
    technician: {
        path: 'technician.name',
    },
    plates: {
        display: false,
    },
    snvLibs: {
        display: false,
    },
    name: {
        index: 1,
    },
    experimentType: {
        header: 'Type',
        format: (x: any) => {
            return _.get(ENUM_LOOKUPS.plasmidExperiments.experimentType, [x.experimentType, 'label'])
        },
        path: 'experimentType.displayValue',
        index: 2,
    }
}
const fieldDefs = {
    startedOn: {
        type: 'date'
    },
    plates: {
        display: false,
    },
    snvLibs: {
        display: false,
    },
}
const withClause = {
    technician: { columns: { name: true } },
    plates: { columns: { id: true } },
    snvLibs: { columns: { id: true } },
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="plasmid-experiments"
                schemaName="select"
                title="Plasmid experiments"
                :rowActions="rowActions"
                :withClause="withClause"
                :columnDefs="columnDefs"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="plasmid-experiments"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="plasmid-experiments"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
