<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'
import  {
    Target,
} from '~/shared/sge/target'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const targetsTable = ref()
const router = useRouter()
const route = useRoute()
const queryParams = route.query
const config = useRuntimeConfig()
const tableTitle = ref(null)
const toast = useToast()
const confirmPopup = useConfirm()
const addRecordValues = ref()

const displayWithClause = Object.freeze({
    project:{
        columns: {name: true}
    },
    region:{
        columns: {name: true}, 
        with: {
            gene: {
                columns: {symbol: true, chromosome: true}
            }
        }
    },
    cycle:{
        columns: {name: true},
    }
})

const rowActions = {
    plasmids: {
        label: (data) => { return `${data.plasmids?.length || 0} Plasmids`},
        action: (data) => {
            router.push({path:'/sge/plasmids', query: {'targetId': data.id}})
        }
    },
    pellets: {
        label: (data) => { return `${data.pellets?.length || 0} Pellets`},
        action: (data) => {
            router.push({path:'/sge/pellets', query: {'targetId': data.id}})
        }
    },
    duplicate: {
        index: -1,  // places this button at the beginning of the row next to edit button
        icon: 'pi pi-copy',
        class: 'invisible group-hover:visible',  // display on hover only
        action: async (data) => {
            const target = new Target(data.id)
            await target.fetch()
            const result = await target.getDuplicate()
            if (!_.isEmpty(result)) { 
                addRecordValues.value = result
                showAddForm.value = true
                showEditForm.value = false
            }
        }
    }
}
const columnDefs = {
    name: {
        index: 0,
    },
    regionId: {
        display: false
    },
    chromosome: {
        header: 'Chromosome',
        format: (x) => _.has(x, 'region.gene.chromosome') ? `chr${x.region.gene.chromosome}`: '',
        index: 1,
    },
    gene: {
        header: 'Gene',
        path: 'region.gene.symbol',
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
    cycleId: {
        display: false
    },
    cycle: {
        path: 'cycle.name',
        index: 5,
    },
    fixedEdits: {
        format: (x) => _.isArray(x.fixedEdits) ? x.fixedEdits.join(', ') : '',
        index: 6,
    },
    transfectTargets: {
        display: false,
    },
}

const fieldDefs = {
    regionId: {
        label: 'Region',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/regions`,
            searchFields: ['name', 'gene.symbol'],
            valueField: 'id',
            displayFormat: (x) => `${x.gene.symbol}: ${x.name}`,
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
        const project = await RecordService.getRecord(`${config.public.apiBase}/projects`, queryParams.projectId)
        tableTitle.value = `${project.name}: targets`
    } else if (queryParams.cycleId) {
        const cycle = await RecordService.getRecord(`${config.public.apiBase}/cycles`, queryParams.cycleId)
        tableTitle.value = `${cycle.name}: targets`
    } else {
        tableTitle.value = `All Targets`
    }
})

function didClickRecordEdit(event) {
    editingRecordId.value = event.id
    showEditForm.value = true
    showAddForm.value = false
}

function didClickRecordAdd() {
    showAddForm.value = true
    showEditForm.value = false
}
function didClickCancelAddForm() {
    showAddForm.value = false
}
function didClickCancelEditForm() {
    editingRecordId.value = null
    showEditForm.value = false
}

function didAddRecord(event) {
    targetsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    targetsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    targetsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}

// convert query params in to JSON Logic to pass as where clause
// TODO - pass more than just the first to QuickTable
const whereClauses = _.map(Object.entries(queryParams), (x) => { return {"==": [{"var": x[0]}, x[1]] }})
const defaultValues = queryParams

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                ref="targetsTable"
                tableName="targets"
                schemaName="select"
                :title="tableTitle"
                :rowActions="rowActions"
                :where="whereClauses[0]"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                :showColumnFilters="true"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="targets"
                schemaName="insert"
                :defaultValues="defaultValues"
                :fieldDefs="fieldDefs"
                :values="addRecordValues"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="targets"
                schemaName="update"
                :defaultValues="defaultValues"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
