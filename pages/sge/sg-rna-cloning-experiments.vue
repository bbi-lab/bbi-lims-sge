<script setup lang="ts">
import _ from 'lodash'
import { RecordService } from '~/utils/service/RecordService'

const crudTable = useCrudTable()
const router = useRouter()
const config = useRuntimeConfig()

async function didAddRecord(event: any) {
    // add corresponding plate
    await RecordService.addRecord(`${config.public.apiBase}/plates`, {
        name: event.name,
        sizeX: 12,
        sizeY: 8,
        plateType: 'guide-rna',
        sgRnaCloningExperimentId: event.id,
    })
    crudTable.tableRef.value.addOrRefreshRecordId(event.id)
    crudTable.state.showAddForm = false
}

const rowActions = {
    plates: {
        label: (data: any) => {
            const plateCount = data.plates?.length || 0
            const sgRnaPlasmidCount = data.sgRnaPlasmids?.length || 0
            return `${plateCount} plate${plateCount == 0 || plateCount > 1 ? 's' : ''} ▪ ${sgRnaPlasmidCount} sgRNA plasmid${sgRnaPlasmidCount == 0 || sgRnaPlasmidCount > 1 ? 's' : ''}`},  // for this to work, we need to expand plates
        action: (data: any) => {
            router.push({path:`/sge/plasmid-experiment/sg-rna/${data.id}`})
        },
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
    sgRnaPlasmids: {
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
    sgRnaPlasmids: {
        display: false,
    },
}
const withClause = {
    technician: { columns: { name: true } },
    plates: { columns: { id: true } },
    sgRnaPlasmids: { columns: { id: true } },
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
                @recordAdd="didAddRecord"
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
