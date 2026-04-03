<script setup lang="ts">
import _ from 'lodash'

const crudTable = useCrudTable()
const config = useRuntimeConfig()

const columnDefs = {
    name: {index: 1},
    sgRnaOligoTargets: {
        header: 'Targets',
        index: 2,
        format: (data: any) => {
            return _.map(data.sgRnaOligoTargets, (sgRnaOligoTarget: any) => {
                return sgRnaOligoTarget.target.name
            })
        },
        path: 'sgRnaOligoTargets.displayValue',
    },
    project: {
        header: 'Project',
        index: 3,
        format: (data: any) => {
            return _.uniq(_.map(data.sgRnaOligoTargets, (sgRnaOligoTarget: any) => {
                return sgRnaOligoTarget.target?.project?.name
            })).join(', ')
        },
        path: 'project.displayValue',
    },
    wellContents: {display: false},
}
const fieldDefs = {
    'sgRnaOligoTargets.*': {
        label: 'Targets',
        component: 'InputArray',
        canDelete: true,
        canUpdate: true,
        props: {
            components: [
                {
                    variableField: 'targetId',
                    label: 'Target',
                    component: 'AutoCompleter',
                    componentProps: {
                        searchBaseUrl: `${config.public.apiBase}/targets`,
                        searchFields: ['name'],
                        valueField: 'id',
                        displayFields: ['name'],
                        dropdown: true,
                    },
                },
            ]
        },
    },
    wellContents: {
        display: false,
    },
}
const displayWithClause = {
    sgRnaOligoTargets: {
        with: {
            target: {
                columns: {
                    name: true,
                },
                with: {
                    project: {
                        columns: {
                            name: true
                        }
                    },
                    region: {
                        columns: {
                            name: true
                        },
                        with: {
                            gene: {
                                columns: {
                                    symbol: true
                                }
                            }
                        }
                    },
                },
            },
        },
    },
    wellable: {
        with: {
            wellContents: {
                with: {
                    well: {
                        columns: {
                            id: true,
                            x: true,
                            y: true,
                        },
                        with: {
                            plate: {
                                columns: {
                                    id: true,
                                    name: true,
                                    plateType: true,
                                }
                            }
                        }
                    },
                },
            },
        }
    },
}
const formWithClause = {
    sgRnaOligoTargets: {
        with: {
            target: {
                columns: {
                    name: true,
                },
            },
        },
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="sg-rna-oligos"
                schemaName="select"
                title="sgRNA Oligos"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="sg-rna-oligos"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                tableName="sg-rna-oligos"
                schemaName="update"
                :recordId="crudTable.state.editingRecordId"
                :fieldDefs="fieldDefs"
                :withClause="formWithClause"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
