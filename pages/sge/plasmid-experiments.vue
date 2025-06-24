<script setup lang="ts">
import _ from 'lodash'
import { RecordService } from '~/utils/service/RecordService'
import PhGridNineFill from '~icons/ph/grid-nine-fill'

const crudTable = useCrudTable()
const config = useRuntimeConfig()
const toast = useToast()
const router = useRouter()

const rowActions = {
    plates: {
        label: (data: any) => { return `${data.plates?.length || 0}`},  // for this to work, we need to expand plates
        action: (data: any) => {
            router.push({path:`/sge/plate-layout/guide-rna/${data.plates[0].id}`})
        },
        iconComponent: PhGridNineFill,
        iconPos: 'right',
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
}
const fieldDefs = {
    startedOn: {
        type: 'date'
    },
    plates: {
        display: false,
    },
}
const withClause = {
    technician: { columns: { name: true } },
    plates: { columns: { id: true } }
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
