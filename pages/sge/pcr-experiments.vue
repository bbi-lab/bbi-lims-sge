
<script setup lang="ts">
import _ from 'lodash'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import PhGridNineFill from '~icons/ph/grid-nine-fill'

const router = useRouter()
const config = useRuntimeConfig()
const crudTable = useCrudTable()

async function didAddRecord(event: any) {
    crudTable.tableRef.value.addOrRefreshRecordIds([event.id])
    crudTable.state.showAddForm = false
}

// the table requests expanded enums, so a table record's pcrType is {value, label, desc} rather
// than the bare value. Form records are fetched unexpanded and still hold the bare value.
const columnDefs: ColumnDefinitions = {
    startedOn: {
        format: 'date-time',
        index: 3,
    },
    plate: {
        display: false,
    },
    technician: {
        path: 'technician.name',
        index: 4,
    },
    pcrType: {
        header: 'Type',
        path: 'pcrType.label',
        index: 2,
    },
    transfectTargetId: {
        display: false,
    },
    name: {
        index: 0,
    },
    plateId: {
        display: false,
    },
    notes: {
        display: false,
    },
    cycleTarget: {
        header: 'Cycle: target(s)',
        format: (x: any) => {
            return _.map(x.pcrExperimentTargets, (t: any) => {
                return t.transfectTarget ? `${t.transfectTarget?.experiment?.cycle?.name}: ${t.transfectTarget?.target?.name}` : ''}).join('; ')
        },
        path: 'cycleTarget.displayValue',
    },
    gelImagesLink: {
        format: 'hyperlink',
    },
    pcrExperimentTargets: {
        display: false,
    },
    status: {
        type: 'element',
        element: (data: any) => recordStatusTag(data.status),
        // format sets status.displayValue, which the column sorts, searches and exports on
        format: (data: any) => recordStatusLabel(data.status),
        path: 'status.displayValue',
        index: 1,
    },
}
const rowActions = {
    plate: {
        label: (data: any) => { return `${data.plate ? 1 : 0}`},
        action: (data: any) => {
            const plateType = data.pcrType.value == 'rna-rt' ? 'rna-rt-storage' : data.pcrType.value
            router.push({path:`/sge/plate-layout/${plateType}/${data.plate?.id}`})
        },
        iconComponent: PhGridNineFill,
        iconPos: 'right',
        tooltip: 'Layout',
    },
    volume: {
        action: (data: any) => {
            if (['dna-preseq-1', 'rna-preseq-1'].includes(data.pcrType.value)) {
                router.push({path: `/sge/preseq-1/volume-calcs/${data.id}`})
            } else if (['dna-preseq-2', 'rna-preseq-2'].includes(data.pcrType.value)) {
                router.push({path: `/sge/preseq-2/volume-calcs/${data.id}`})
            } else if (['dna-preseq-3', 'rna-preseq-3'].includes(data.pcrType.value)) {
                router.push({path: `/sge/preseq-3/volume-calcs/${data.id}`})
            }
        },
        visible: (data: any) => ['dna-preseq-1', 'rna-preseq-1', 'dna-preseq-2', 'rna-preseq-2', 'dna-preseq-3', 'rna-preseq-3'].includes(data.pcrType.value),
        tooltip: 'Volume calcs',
        icon: 'pi pi-calculator',
        iconPos: 'right',
    },
}
const addFieldDefs = {
    name: {
        index: 1,
    },
    status: {
        index: 2,
    },
    technician: {
        index: 3,
    },
    pcrType: {
        events: {
            change: async (record: any, recordOld: any) => {
                // set or unset pcrExperimentTargets based on pcrType
                if (_.includes(['rna-rt','dna-preseq-1'], record.pcrType) && !_.has(record, 'pcrExperimentTargets.0')) {
                    _.set(record, 'pcrExperimentTargets', [{transfectTargetId: null}])
                } else if (record.pcrType == 'dna-preseq-1' && _.size(_.get(record, 'pcrExperimentTargets', [])) > 1) {
                    _.set(record, 'pcrExperimentTargets', _.slice(record.pcrExperimentTargets, 0, 1))
                } else if (!_.includes(['rna-rt','dna-preseq-1'], record.pcrType)) {
                    _.unset(record, 'pcrExperimentTargets')
                }
            },
        },
        index: 4,
    },
    plateId: {
        // only display with widget for RNA RT experiments, all other PCR experiments have 96-well plates created automatically
        display: (x: any) => {
            return x.pcrType == 'rna-rt'
        },
        label: 'Storage Box',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/plates`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
            searchWhereClause: {
                '==': [{'var': 'plateType'}, 'rna-rt-storage'],
            },
        },
        index: 5,
    },
    startedOn: {
        type: 'date',
    },
    pcrExperimentTargets: {
        display: (x: any) => {
            return _.includes(['rna-rt','dna-preseq-1'], x.pcrType)
        },
        fixedSize: (record: any) => {
            return record.pcrType == 'dna-preseq-1'
        },
    },
    'pcrExperimentTargets.*': {
        label: 'Targets',
        component: 'InputArray',
        canDelete: true,
        canUpdate: true,
        props: {
            components: [
                {
                    variableField: 'transfectTargetId',
                    label: 'Target',
                    component: 'AutoCompleter',
                    display: (x: any) => {
                        return _.includes(['dna-preseq-1', 'rna-rt'], x.pcrType)
                    },
                    componentProps: {
                        searchBaseUrl: `${config.public.apiBase}/transfect-targets`,
                        searchFields: ['target.name', 'target.region.gene.symbol', 'target.region.name', 'experiment.cycle.name'],
                        valueField: 'id',
                        displayFormat: (x: any) => {
                            const targetName = x.target?.name ?? `${x.target?.region?.gene?.symbol}:${x.target?.region?.name}`
                            const cycleName = x.experiment?.cycle?.name
                            return cycleName ? `${targetName} (${cycleName})` : targetName
                        },
                        searchWithClause: {
                            target: {columns: {name: true}, with: {region: {columns: {name: true}, with: {gene: {columns: {symbol: true}}}}}},
                            experiment: {columns: {}, with: {cycle: {columns: {name: true}}}},
                        },
                        inputClass: 'w-64',
                    }
                },
            ],
        },
    },
}

const editFieldDefs = {
    ...addFieldDefs,
    pcrType: {
        readOnly: true,
    },

}
const withClause = {
    plate: {columns: {id: true}},
    technician: {columns: {name: true}},
    pcrExperimentTargets: {
        with: {
            transfectTarget: {
                with: {
                    target: {
                        columns: {
                            name: true
                        },
                    },
                    experiment: {
                        columns: {},
                        with: {
                            cycle: {
                                columns: {
                                    name: true
                                }
                            }
                        }
                    }
                },
            }
        }
    },
}

const formWithClause = {
    plate: {
        columns: {
            id: true,
            name: true,
        },
    },
    pcrExperimentTargets: {
        with: {
            transfectTarget: {
                with: {
                    target: {
                        columns: {
                            name: true
                        },
                    },
                    experiment: {
                        columns: {},
                        with: {
                            cycle: {
                                columns: {
                                    name: true
                                }
                            }
                        }
                    }
                },
            }
        }
    },
}

</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="pcr-experiments"
                schemaName="select"
                title="PCR Experiments"
                :rowActions="rowActions"
                :withClause="withClause"
                :columnDefs="columnDefs"
                :expandEnums="true"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="pcr-experiments"
                schemaName="insert"
                :fieldDefs="addFieldDefs"
                :withClause="formWithClause"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="pcr-experiments"
                schemaName="update"
                :fieldDefs="editFieldDefs"
                :withClause="formWithClause"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
