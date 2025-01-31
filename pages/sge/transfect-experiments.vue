<script setup>
import _ from 'lodash'
import moment from 'moment'
import DotsTriangle from '~icons/mdi/dots-triangle'
import BeakerOutline from '~icons/mdi/beaker-outline'

const showAddForm = ref(false)
const showEditForm = ref(false)
const editingRecordId = ref(null)
const transfectionExperimentsTable = ref()
const config = useRuntimeConfig()
const router = useRouter()

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
    transfectionExperimentsTable.value.addOrRefreshRecordId(event.id)
    showAddForm.value = false
}
function didUpdateRecord(event) {
    transfectionExperimentsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
function didDeleteRecord(event) {
    transfectionExperimentsTable.value.removeRecordId(event.id)
    showEditForm.value = false
}
function getPelletCount(targets) {
    if (_.isArray(targets)) {
        return _.reduce(targets, (sum, {pellets}) => {
            return sum + (pellets?.length || 0)
        }, 0)
    } else {
        return 0
    }
}

const editWithClause = Object.freeze({transfectTargets: {with: {target:  true}}})
const displayWithClause = Object.freeze({
    technician: {columns: {name: true}},
    transfectLotUsage: {columns: {},  
        with: {
            lot:  {
                columns: {
                    lotNumber: true
                }
            },
        }
    },
    transfectTargets:{
        columns: {},
        with: {
            target:  {
                columns: {
                    name: true,
                },
                with: {
                    region:{
                        columns: {name: true}, 
                        with: {
                            gene: {
                                columns: {symbol: true}
                            }
                        }
                    },
                }
            },
            pellets: {
                columns: {
                    id: true
                }
            }
        }
    },
})

const columnDefs = {
    startedOn: {
        format: 'date-time'
    },
    technician: {
        format: (x) => _.get(x, 'technician.name'),
    },
    transfectTargets: {
        header: 'Targets',
        format: (x) => _.join(_.map(_.get(x, 'transfectTargets', []), (y) => {
            return  y.target?.name || `${y.target?.region?.gene?.symbol}: ${y.target?.region?.name}`
        }), ', ')
    },
    transfectLotUsage: {
        header: 'Reagents',
        format: (x) => _.join(_.uniq(_.map(_.get(x, 'transfectLotUsage', []), (y) => {
            return  y.lot.lotNumber
        })), ', ')
    },
    currentDay: {
        header: 'Current day #',
        format: (x) => { 
            const days = moment().diff(moment(x.startedOn), 'days')
            return days ? `Day ${days > 17 ? '17+' : days}` : ''
        }
    },
}

const rowActions = {
    targets: {
        label: (data) => { return `${data.transfectTargets?.length || 0}`}, 
        action: (data) => {
            router.push({path:`/sge/transfect-experiment/${data.id}/targets`})
        },
        icon: 'pi pi-fw pi-bullseye',
        iconPos: 'right',
        tooltip: 'Targets',
    },
    pellets: {
        label: (data) => { return `${getPelletCount(data.transfectTargets)}`}, 
        action: (data) => {
            router.push({path:'/sge/pellets', query: {'transfectTargetId.experiment.id': data.id}})
        },
        iconComponent: DotsTriangle,
        iconPos: 'right',
        tooltip: 'Pellets',
    },
    reagents: {
        label: (data) => { return `${data.transfectLotUsage?.length || 0}`},
        action: (data) => {
            router.push({path:`/sge/transfect-experiment/${data.id}/lot-usage`})
        },
        iconComponent: BeakerOutline,
        iconPos: 'right',
        tooltip: 'Reagents',
    },
    harvest: {
        label: () => 'Harvest', 
        action: (data) => {
            router.push({path:`/sge/transfect-experiment/${data.id}/harvest`})
        },
        severity: 'warn',
        icon: 'pi pi-bolt',
        iconPos: 'right',
    },

}

const fieldDefs = {
    'transfectTargets.*': {
        label: 'Targets',
        component: 'ManyToMany',
        canDelete: false,
        canUpdate: false,
        props: {
            baseUrl: `${config.public.apiBase}/transfect-targets`,
            fixedValueField: 'experimentId',
            variableField: 'targetId',
            component: 'AutoCompleter',
            componentProps: {
                searchBaseUrl: `${config.public.apiBase}/targets`,
                searchFields: ['region.gene.symbol', 'region.name', 'name'],
                valueField: 'id',
                displayOptions: {primary: {fields: ['name']}, secondary: {fields: ['region.gene.symbol', 'region.name'], operator: 'join', seperator: ': '}},
                searchWithClause: {region: {columns: {name: true}, with: {gene: {columns: {symbol:true}}}}},
            },
        }
    },
}
</script>
<template>
    <Splitter>
        <SplitterPanel :size="50">
            <QuickTable
                ref="transfectionExperimentsTable"
                tableName="transfect-experiments"
                schemaName="select"
                title="Transfection experiments"
                :rowActions="rowActions"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
                @clickedRecordEdit="didClickRecordEdit"
                @clickedRecordAdd="didClickRecordAdd"
            />
        </SplitterPanel>
        <SplitterPanel class="p-8" v-if="showAddForm || showEditForm">
            <QuickForm
                v-if="showAddForm"
                tableName="transfect-experiments"
                schemaName="insert"
                :fieldDefs="{transfectTargets: {display: false}}"
                @cancel="didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="transfect-experiments"
                schemaName="update"
                :withClause="editWithClause"
                :fieldDefs="fieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
