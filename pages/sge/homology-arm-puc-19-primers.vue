<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'

const config = useRuntimeConfig()
const crudTable = useCrudTable()

const withClause = Object.freeze({
    homologyArmPrimer: {
        with: {
            targets: {
                with: {
                    target: {
                        columns: {
                            id: true,
                            name: true,
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
    }
})

const columnDefs: ColumnDefinitions = {
    name: {
        index: 1
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
        index: 4,
    },
    homologyArmPrimerId: { display: false },
    homologyArmPrimer: {
        path: 'homologyArmPrimer.name',
        index: 2,
    },
    sequence: {
        index: 3,
    },
}

const homologyArmPrimerSequence = ref<string>('')

const fieldDefs: FieldDefinitions = {
    homologyArmPrimerId: {
        label: 'Homology Arm Primer',
        subtext: (_data, relatedData) => {
            const haPrimerSequence = _.has(relatedData, 'homologyArmPrimerId') ? _.get(relatedData, 'homologyArmPrimerId.sequence') : _.get(_data, 'homologyArmPrimer.sequence')
            return `Sequence: ${haPrimerSequence || ''}`
        },
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/homology-arm-primers`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
        },
        events: {
            change: async (record: any, recordOld: any) => {
                // auto-calculate name if homologyArmPrimerId changes
                if (record?.homologyArmPrimerId != recordOld?.homologyArmPrimerId) {
                    if (!record?.homologyArmPrimerId) {
                        record.name = ''
                        record.sequence = ''
                    } else {
                        const haPrimer = await RecordService.getRecord(`${config.public.apiBase}/homology-arm-primers`, record.homologyArmPrimerId as string, {})
                        record.name = _.replace(_.replace(haPrimer.name, /_F$/gi , '_pUC19_F'), /_R$/gi , '_pUC19_R')
                        homologyArmPrimerSequence.value = haPrimer.sequence
                        if (haPrimer.sequenceType == 'forward') {
                            record.sequence = `GTTTTCCCAGTCACGACGTTGTAAAACGACGGCCAGT${haPrimer.sequence}`
                        } else if (haPrimer.sequenceType == 'reverse') {
                            record.sequence = `GATTACGCCAAGCTTGCATGCCTGCAGGT${haPrimer.sequence}`
                        }
                    }
                }
            },
        },
        index: 0,
    },
    name: {
        index: 2,
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="homology-arm-puc-19-primers"
                schemaName="select"
                title="Homology Arm PUC 19 Primers"
                :with-clause="withClause"
                :column-defs="columnDefs"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="homology-arm-puc-19-primers"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="homology-arm-puc-19-primers"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="{homologyArmPrimer: true}"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
