<script setup lang="ts">
import _ from 'lodash'
import { RecordService } from '~/utils/service/RecordService'
import PhGridNineFill from '~icons/ph/grid-nine-fill'

const crudTable = useCrudTable()
const router = useRouter()
const config = useRuntimeConfig()

// async function didAddRecord(event: any) {
//     // add corresponding plate
//     await RecordService.addRecord(`${config.public.apiBase}/plates`, {
//         name: event.name,
//         sizeX: 12,
//         sizeY: 8,
//         plateType: 'sg-rna-oligo',
//         sgRnaCloningExperimentId: event.id,
//     })
//     crudTable.tableRef.value.addOrRefreshRecordIds([event.id])
//     crudTable.state.showAddForm = false
// }

const rowActions = {
    plates: {
        label: (data: any) => { return `${data.plates?.length || 0}`},  // for this to work, we need to expand plates
        action: (data: any) => {
            router.push({path:`/sge/plasmid-experiment/sg-rna/${data.id}`})
        },
        iconComponent: PhGridNineFill,
        iconPos: 'right',
        tooltip: 'Plates',
    }
}

const columnDefs = {
    technician: {
        path: 'technician.name',
    },
    plates: {
        display: false,
    },
    name: {
        index: 1,
    },
}
const fieldDefs = {
    plates: {
        display: false,
    },
}
const withClause = {
    technician: { columns: { name: true } },
    plates: { columns: { id: true } },
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="sg-rna-cloning-experiments"
                schemaName="select"
                title="sgRNA Cloning"
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
                tableName="sg-rna-cloning-experiments"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="sg-rna-cloning-experiments"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
