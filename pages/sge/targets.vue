<script setup lang="ts">
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'
import DotsTriangle from '~icons/mdi/dots-triangle'
import  {
    Target,
} from '~/shared/sge/target'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import type { FieldDefinitions } from '~/components/QuickForm.vue'

const router = useRouter()
const route = useRoute()
const crudTable = useCrudTable()
const config = useRuntimeConfig()

const queryParams = route.query
const tableTitle = ref<string>()
const addRecordValues = ref()

const displayWithClause = Object.freeze({
    project:{
        columns: {name: true}
    },
    region:{
        columns: {name: true},
        with: {
            gene: {
                columns: {symbol: true, ncbiAccession: true, chromosome: true}
            }
        }
    },
    transfectTargets: {
        with: {
            pellets: true
        }
    },
})

const rowActions = {
    plasmids: {
        label: (data: any) => { return `${data.plasmids?.length || 0}`},
        action: (data: any) => {
            router.push({path:'/sge/plasmids', query: {'targetId': data.id}})
        },
        icon: 'pi pi-fw pi-spinner',
        iconPos: 'right',
        tooltip: 'Plasmids',
    },
    pellets: {
        label: (data: any) => { return `${_.sumBy(data.transfectTargets, (x: any) => x.pellets.length)}`},
        action: (data: any) => {
            router.push({path:'/sge/pellets', query: {'transfectTarget.target.id': data.id}})
        },
        iconComponent: DotsTriangle,
        iconPos: 'right',
        tooltip: 'Pellets',
    },
    duplicate: {
        index: -1,  // places this button at the beginning of the row next to edit button
        icon: 'pi pi-copy',
        class: 'invisible group-hover:visible',  // display on hover only
        action: async (data: any) => {
            const target = new Target(data.id)
            await target.fetch()
            const result = await target.getDuplicate()
            if (!_.isEmpty(result)) {
                addRecordValues.value = result
                crudTable.state.showAddForm = true
                crudTable.state.showEditForm = false
            }
        }
    }
}
const columnDefs: ColumnDefinitions = {
    name: {
        index: 0,
    },
    regionId: {
        display: false
    },
    chromosome: {
        header: 'Chromosome',
        format: (x) => _.has(x, 'region.gene.chromosome') ? `chr${x.region.gene.chromosome}`: '',
        path: 'chromosome.displayValue',
        type: 'string',
        index: 1,
    },
    gene: {
        header: 'Gene',
        format: (x) => { return `${_.get(x, 'region.gene.symbol')} (${_.get(x, 'region.gene.ncbiAccession')})`},
        path: 'gene.displayValue',
        index: 2,
    },
    region: {
        header: 'Region',
        path: 'region.name',
        index: 3,
    },
    projectId: {
        display: false
    },
    project: {
        path: 'project.name',
        index: 4,
    },
    fixedEdits: {
        format: (x) => _.isArray(x.fixedEdits) ? x.fixedEdits.join(', ') : '',
        path: 'fixedEdits.displayValue',
        type: 'string',
        index: 5,
    },
    transfectTargets: {
        display: false,
    },
}

const fieldDefs: FieldDefinitions = {
    regionId: {
        label: 'Region',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/regions`,
            searchFields: ['name', 'gene.symbol'],
            valueField: 'id',
            displayFormat: (x:any) => `${x.gene.symbol}: ${x.name}`,
            searchWithClause: {gene: {columns: {symbol:true}}},
        }
    },
    projectId: {
        label: 'Project',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/projects`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        }
    },
    cycleId: {
        label: 'Cycle',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/cycles`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        }
    },
    transfectTargets: {
        display: false,
    },
}

onMounted(async() => {
    if (queryParams.projectId) {
        const project = await RecordService.getRecord(`${config.public.apiBase}/projects`, queryParams.projectId as string, {})
        tableTitle.value = `${project.name}: targets`
    } else {
        tableTitle.value = `All Targets`
    }
})

// convert query params in to JSON Logic to pass as where clause
// TODO - pass more than just the first to QuickTable
const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})
const readonlyValues = queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="targets"
                schemaName="select"
                :title="tableTitle"
                :rowActions="rowActions"
                :where="whereClauses[0]"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                :showColumnFilters="true"
                :canEditMultiple="true"
                :selection-disabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="targets"
                schemaName="insert"
                :readonlyValues="readonlyValues"
                :fieldDefs="fieldDefs"
                :values="addRecordValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="targets"
                schemaName="update"
                :readonlyValues="readonlyValues"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="targets"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
</template>
