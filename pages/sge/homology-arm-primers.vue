<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'

const config = useRuntimeConfig()
const crudTable = useCrudTable()

const withClause = Object.freeze({
    targets: {
        with: {
            target: {
                columns: {
                    id: true,
                    name: true,
                }
            },
        }
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
    }
})

const columnDefs: ColumnDefinitions = {
    name: {
        index: 1
    },
    targets: {
        format: (data: any) => {
            return _.map(data.targets, 'target.name')
        },
        path: 'targets.displayValue',
        index: 2,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            //.return _.has(x, 'wellContents.well.plate') ? ` ${_.get(x, 'wellContents.well.plate.name')}: ${wellCoordinateToChar(x.wellContents?.well?.y)}${x.wellContents?.well?.x}` : ''
            if (!_.isEmpty(x?.wellable?.wellContents)) {
                return _.map(x.wellable.wellContents, (wellContent) => {
                    return `${_.get(wellContent, 'well.plate.name')}: ${wellCoordinateToChar(wellContent?.well?.y)}${wellContent?.well?.x}`
                }).join(', ')
            } else {
                return ''
            }
        },
        path: 'wellContents.displayValue',
        type: 'string',
        index: 5,
    },
}

const fieldDefs: FieldDefinitions = {
    'targets.*': {
        label: 'Targets',
        component: 'InputArray',
        canDelete: false,
        canUpdate: true,
        props: {
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
            ]
        }
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="homology-arm-primers"
                schemaName="select"
                title="Homology Arm Primers"
                :with-clause="withClause"
                :column-defs="columnDefs"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="homology-arm-primers"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :withClause="withClause"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="homology-arm-primers"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="withClause"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
