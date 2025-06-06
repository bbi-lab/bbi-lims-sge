<script setup lang="ts">
import _ from 'lodash'
import moment from 'moment'
import DotsTriangle from '~icons/mdi/dots-triangle'
import BeakerOutline from '~icons/mdi/beaker-outline'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import type { FieldDefinitions } from '~/components/QuickForm.vue'

const config = useRuntimeConfig()
const router = useRouter()
const crudTable = useCrudTable()

function getPelletCount(targets: any) {
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
    cycle: {columns: {name: true}},
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
        columns: {
            transfectionCount: true,
        },
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

const columnDefs: ColumnDefinitions = {
    cycleId: {
        header: 'Cycle',
        index: 1,
        path: 'cycle.name',
    },
    startedOn: {
        format: 'date-time',
        index: 3,
    },
    currentDay: {
        header: 'Current day #',
        format: (x) => {
            const days = moment().diff(moment(x.startedOn), 'days')
            return days ? `Day ${days > 17 ? '17+' : days}` : ''
        },
        path: 'currentDay.displayValue',
        type: 'string',
        index: 3,
    },
    replicateCount: {
        header: 'Number of replicates',
        index: 4,
    },
    transfectionCount: {
        display: false,
    },
    transfectionsPerReplicate: {
        header: 'Transfections per replicate',
        format: (x) => {
            const transfectionCounts = _.map(x.transfectTargets, 'transfectionCount')
            const minTransfectionsPerReplicate = _.min(transfectionCounts)
            const maxTransfectionsPerReplicate = _.max(transfectionCounts)
            return minTransfectionsPerReplicate == maxTransfectionsPerReplicate ? minTransfectionsPerReplicate : `${minTransfectionsPerReplicate} - ${maxTransfectionsPerReplicate}`
        },
        path: 'transfectionsPerReplicate.displayValue',
        index: 5,
    },
    negativeControlCount: {
        header: 'Negative control',
        format: (x) => {
            return x.negativeControl ? '1' : '0'
        },
        path: 'negativeControlCount.displayValue',
        type: 'string',
        index: 6,
    },
    negativeControl: {
        display: false,
    },
    totalTransfections: {
        header: 'Total transfections',
        format: (x) => {
            const transfectionCounts = _.map(x.transfectTargets, 'transfectionCount')
            const minTransfectionsPerReplicate = _.min(transfectionCounts)
            const maxTransfectionsPerReplicate = _.max(transfectionCounts)
            if (!minTransfectionsPerReplicate) {
                return ''
            } else {
                return minTransfectionsPerReplicate == maxTransfectionsPerReplicate ?
                    _.toString(minTransfectionsPerReplicate * x.replicateCount + (x.negativeControl ? 1 : 0)) :
                    `${minTransfectionsPerReplicate * x.replicateCount + (x.negativeControl ? 1 : 0)} - ${maxTransfectionsPerReplicate * x.replicateCount + (x.negativeControl ? 1 : 0)}`
            }
        },
        path: 'totalTransfections.displayValue',
        index: 7,
    },
    transfectTargets: {
        header: 'Targets',
        format: (x) => _.join(_.map(_.get(x, 'transfectTargets', []), (y) => {
            return  y.target?.name || `${y.target?.region?.gene?.symbol}: ${y.target?.region?.name}`
        }), ', '),
        path: 'transfectTargets.displayValue',
        type: 'string',
        index: 8,
    },
    transfectLotUsage: {
        header: 'Reagents',
        format: (x) => _.join(_.map(_.get(x, 'transfectLotUsage', []), (y) => {
            return  y.lot.lotNumber
        }), ', '),
        path: 'transfectLotUsage.displayValue',
        type: 'string',
        index: 9,
    },
    technician: {
        path: 'technician.name',
    },
}

const rowActions = {
    targets: {
        label: (data: any) => { return `${data.transfectTargets?.length || 0}`},
        action: (data: any) => {
            router.push({path:`/sge/transfect-experiment/${data.id}/targets`})
        },
        icon: 'pi pi-fw pi-bullseye',
        iconPos: 'right',
        tooltip: 'Targets',
    },
    pellets: {
        label: (data: any) => { return `${getPelletCount(data.transfectTargets)}`},
        action: (data: any) => {
            router.push({path:'/sge/pellets', query: {'transfectTarget.experiment.id': data.id}})
        },
        iconComponent: DotsTriangle,
        iconPos: 'right',
        tooltip: 'Pellets',
    },
    reagents: {
        label: (data: any) => { return `${data.transfectLotUsage?.length || 0}`},
        action: (data: any) => {
            router.push({path:`/sge/transfect-experiment/${data.id}/lot-usage`})
        },
        iconComponent: BeakerOutline,
        iconPos: 'right',
        tooltip: 'Reagents',
    },
    harvest: {
        label: () => 'Harvest',
        action: (data: any) => {
            router.push({path:`/sge/transfect-experiment/${data.id}/harvest`})
        },
        severity: 'warn',
        icon: 'pi pi-bolt',
        iconPos: 'right',
    },
}

const fieldDefs: FieldDefinitions = {
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
    replicateCount: {
        label: 'Number of replicates',
    },
    transfectionCount: {
        display: false,
    },
    'transfectTargets.*': {
        label: 'Targets',
        component: 'ManyToMany',
        canDelete: false,
        canUpdate: false,
        props: {
            fixedValueField: 'experimentId',
            components: [
                {
                    variableField: 'targetId',
                    label: 'Target',
                    component: 'AutoCompleter',
                    componentProps: {
                        searchBaseUrl: `${config.public.apiBase}/targets`,
                        searchFields: ['region.gene.symbol', 'region.name', 'name'],
                        valueField: 'id',
                        inputClass: 'w-64',
                        displayFormat: (x: any) => {
                            return x.name ?? `${x.region?.gene?.symbol}: ${x.region?.name}`
                        },
                        searchWithClause: {region: {columns: {name: true}, with: {gene: {columns: {symbol:true}}}}},
                    },
                },
                {
                    variableField: 'transfectionCount',
                    component: 'InputNumber',
                    label: '# of transfections',
                    componentProps:{
                        inputClass: 'w-40',
                        defaultValue: 3,
                        showButtons: true,
                    },
                },
            ]
        }
    },
    transfectLotUsage: {display: false},
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="transfect-experiments"
                schemaName="select"
                title="Transfection experiments"
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
                tableName="transfect-experiments"
                schemaName="insert"
                :fieldDefs="{...fieldDefs, transfectTargets: {display: false}}"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="transfect-experiments"
                schemaName="update"
                :withClause="editWithClause"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
