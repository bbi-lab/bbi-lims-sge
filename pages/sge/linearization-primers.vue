<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'

const config = useRuntimeConfig()
const crudTable = useCrudTable()

const displayWithClause = Object.freeze({
    target: {
        columns: {
            name: true
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
            }
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
        },
    },
})

const columnDefs: ColumnDefinitions = {
    name: {
        index: 1
    },
    targetId: {
        header: 'Target',
        format: (x) => {
            return x.target?.name || (x.target?.region ? `${_.get(x, 'target.region.gene.symbol')} : ${_.get(x, 'target.region.name')}` : '')
        },
        path: 'targetId.displayValue',
        type: 'string',
        index: 2,
    },
    project: {
        format: (x) => {
            return x.target?.project?.name || ''
        },
        path: 'project.displayValue',
        index: 3,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
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
    targetId: {
        label: 'Target',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/targets`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        }
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="linearization-primers"
                schemaName="select"
                title="Linearization Primers"
                :with-clause="displayWithClause"
                :columnDefs="columnDefs"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="linearization-primers"
                schemaName="insert"
                :field-defs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="linearization-primers"
                schemaName="update"
                :field-defs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
