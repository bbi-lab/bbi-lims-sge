
<script setup lang="ts">
import _ from 'lodash'
import { read } from 'xlsx'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { ENUM_LOOKUPS } from '~/server/db/schema/sge/enum-lookups'
import PhGridNineFill from '~icons/ph/grid-nine-fill'

const router = useRouter()
const config = useRuntimeConfig()
const crudTable = useCrudTable()

async function didAddRecord(event: any) {
    crudTable.tableRef.value.addOrRefreshRecordIds([event.id])
    crudTable.state.showAddForm = false
}

const columnDefs: ColumnDefinitions = {
    startedOn: {
        format: 'date-time',
        index: 2,
    },
    plate: {
        display: false,
    },
    technician: {
        path: 'technician.name',
        index: 3,
    },
    pcrType: {
        display: false,
    },
    transfectTargetId: {
        display: false,
    },
    name: {
        index: 0,
    },
    pcrTypeLabel: {
        header: 'Type',
        format: (x: any) => {
            return _.get(ENUM_LOOKUPS.pcrExperiments.pcrType, [x.pcrType, 'label'])
        },
        path: 'pcrTypeLabel.displayValue',
        index: 1,
    },
    cycleTarget: {
        header: 'Cycle: target(s)',
        format: (x: any) => {
            return _.map(x.pcrExperimentTargets, (t: any) => {
                return t.transfectTarget ? `${t.transfectTarget?.experiment?.cycle?.name}: ${t.transfectTarget?.target?.name}` : ''}).join('; ')
        },
        path: 'cycleTarget.displayValue',
    },
    pcrExperimentTargets: {
        display: false,
    },
}
const rowActions = {
    plate: {
        label: (data: any) => { return `${data.plate ? 1 : 0}`},
        action: (data: any) => {
            const plateType = data.pcrType == 'rna-rt' ? 'rna-rt-storage' : data.pcrType
            router.push({path:`/sge/plate-layout/${plateType}/${data.plate?.id}`})
        },
        iconComponent: PhGridNineFill,
        iconPos: 'right',
        tooltip: 'Plates',
    }
}
const addFieldDefs = {
    name: {
        index: 1,
    },
    technician: {
        index: 2,
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
        index: 3,
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
        index: 4,
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
                    component: 'NestedSelect',
                    display: (x: any) => {
                        return _.includes(['preseq-1','dna-preseq-1', 'rna-rt'], x.pcrType)
                    },
                    componentProps: {
                        parentSearchBaseUrl: `${config.public.apiBase}/transfect-experiments`,
                        parentSearchFields: ['cycle.name'],
                        parentValueField: 'id',
                        parentDisplayFields: ['cycle.name'],
                        parentIftaLabel: 'Experiment',
                        parentSearchWithClause: {
                            cycle: {columns: {name: true}},
                        },

                        searchBaseUrl: `${config.public.apiBase}/transfect-targets`,
                        searchFields: ['target.name', 'target.region.gene.symbol', 'target.region.name'],
                        valueField: 'id',
                        displayFormat: (x:any) => { return x.target?.name ?? `${x.target?.region?.gene?.symbol}:${x.target.region.name}`},
                        parentKeyField: 'experimentId',
                        searchWithClause: {
                            target: {columns: {name: true}, with: {region: {columns: {name: true}, with: {gene: {columns: {symbol: true}}}}}},
                        },
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
