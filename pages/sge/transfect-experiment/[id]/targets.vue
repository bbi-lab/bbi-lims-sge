<script setup lang="ts">
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'

const config = useRuntimeConfig()
const crudTable = useCrudTable()
const route = useRoute()

const tableTitle = ref<string>()
const rowActions = {}

onMounted(async() => {
    if (route.params.id) {
        const experiment = await RecordService.getRecord(`${config.public.apiBase}/transfect-experiments`, route.params.id, {cycle: {columns: {name: true}}})
        tableTitle.value = `${experiment.cycle.name}: targets`
    } else {
        tableTitle.value = 'Transfection experiment targets'
    }
})

const columnDefs = {
    target: {
        format: (x: any) => { return x.target?.name || `${x.target?.region?.gene?.symbol}: ${x.target?.region?.name}` },
        path: 'target.displayValue',
        type: 'string',
        index: 0,
    },
    transfectionCount: {
        header: '# transfections',
        index: 1,
    },
    experimentId: {
        display: false,
    },
    targetId: {
        display: false,
    },
    snvLibraryConc: {
        header: 'SNV library conc. (ng/μL)',
    },
    snvLibraryTo3ugVol: {
        header: 'Vol. of SNVlib to 3µg (μL)',
    },
    sgRna: {
        header: 'sgRNA',
    },
    sgRnaConc: {
        header: 'Current sgRNA conc. (ng/μL)'
    },
    sgRnaTo12ugVol: {
        header: 'Vol. of sgRNA to 12µg (μL)'
    },
    sgRnaNegControl: {
        header: 'sgRNA negative control'
    },
    hprt1SgRnaConc: {
        header: 'HPRT1 sgRNA conc. (ng/μL)'
    },
    hprt1SgRnaTo12ugVol: {
        header: 'Vol. of HPRT1 sgRNA to 12µg (μL)'
    },
    xfectBuffer: {
        header: 'Xfect Buffer (μL)'
    },
    xfectPolymerPerTransfect: {
        header: 'Xfect polymer (μL) per transfection'
    },
    snvLibNeeded: {
        header: 'SNV library needed (μL)'
    },
    sgRnaNeeded: {
        header: 'sgRNA needed (μL)'
    }
}

// Generate field defs from column defs to avoid repeating ourselves
const editFormFieldDefs: FieldDefinitions = _.mapValues(columnDefs, (v: any, k) => {
    return {
        display: v.display ?? true,
        label: v.header || k,
        index: v.index,
    }
})
// Include an AutoCompleter widget for adding new targets
editFormFieldDefs['targetId'] = {
    label: 'Target',
    component: 'AutoCompleter',
    readOnly: true,
    props: {
        searchBaseUrl: `${config.public.apiBase}/targets`,
        searchFields: ['region.gene.symbol', 'region.name', 'name'],
        valueField: 'id',
        displayFormat: (x: any) => {
            return x.name ?? `${x.region?.gene?.symbol}: ${x.region?.name}`
        },
        searchWithClause: {region: {columns: {name: true}, with: {gene: {columns: {symbol:true}}}}},
    },
    index: 0,
}
const addFormFieldDefs = _.cloneDeep(editFormFieldDefs)
_.set(addFormFieldDefs, 'targetId.readOnly', false)

const readonlyValues = {experimentId: route.params.id}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="transfect-targets"
                schemaName="select"
                :title="tableTitle"
                :rowActions="rowActions"
                :columnDefs="columnDefs"
                :where="{'==':[{'var': 'experimentId'}, route.params.id]}"
                :withClause="{target: {columns: {name: true}, with: {region: {columns: {name: true}, with: {gene: {columns: {symbol: true}}}}}}}"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="transfect-targets"
                schemaName="insert"
                :fieldDefs="addFormFieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="transfect-targets"
                schemaName="update"
                :fieldDefs="editFormFieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
