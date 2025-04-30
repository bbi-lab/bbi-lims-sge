<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, wellCoordinateToChar, type PlateDiagramWell } from '@/composables/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import type { PlateWithPlateDiagramWells } from '~/components/PlateDiagram.vue'
import type { WellContent } from '~/server/db/schema/sge/well'
import { type PlateWithWellContents, type WellSpecs, updateWellSpecs } from '~/utils/sge/plateUtils'
import { PLATE_TYPE_SPECS } from '~/utils/sge/plateUtils'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()
const breakpoints = useBreakpoints(breakpointsTailwind)
const smallerThanLg = breakpoints.smaller('lg')

const plateWithWellContents = ref<PlateWithWellContents>()
const contentSelectionTable = ref()
const plateWithPlateDiagramWells = ref<PlateWithPlateDiagramWells>()
const plateDiagram = ref()
const selectedWells = ref<PlateDiagramWell[]>()
const wellSpecs = ref<WellSpecs>({})

const plateType = route.params.plateType as 'amp-storage' | 'lin-storage' | 'ha-storage' | 'preseq-1' | 'preseq-2' | 'preseq-3'
const wellContentsKey = _.get(PLATE_TYPE_SPECS, [plateType, 'wellContentsKey'])
const tableName = _.get(PLATE_TYPE_SPECS, [ plateType, 'selectionTableName'])

const colorMapBySelectionTableId = computed(() => {
    const colorMap = {}
    _.forEach(_.values(wellSpecs.value), (wellSpec) => {
        _.forEach(wellSpec.contentFKs, (wellContentFK) => {
            _.set(colorMap, wellContentFK, wellSpec.color)
        })
    })
    return colorMap
})

const frozenRecordIds = computed(() => {
    return _.compact(_.flatten(_.map(selectedWells.value, (well) => {
        return _.map(well.data.wellContents, (contents) => { return _.get(contents, [wellContentsKey, 'id']) })
    })))
})

onMounted(async() => {
    refreshPlate()
})

const refreshPlate = async () => {
    plateWithWellContents.value = await RecordService.getRecord(
        `${config.public.apiBase}/plates`,
        route.params.id as string,
        {
            wells: {
                columns: {
                    id: true,
                    x: true,
                    y: true
                },
                with: {
                    wellContents: {
                        with: {
                            amplificationPrimer: route.params.plateType == 'amp-storage',
                            linearizationPrimer: route.params.plateType == 'lin-storage',
                            homologyArmPrimer: route.params.plateType == 'ha-storage',
                            nucleicAcid: _.includes(['preseq-1', 'preseq-2', 'preseq-3'], route.params.plateType) ? {with: {pellet: true}} : false,
                        }
                    },
                }
            }
        }
    )
    if (_.isEmpty(plateWithWellContents.value)) return

    updateWellSpecs(wellSpecs.value, plateWithWellContents.value)

    // replace wells from data model with plateDiagramWells to include visualization properties
    plateWithPlateDiagramWells.value = {
        ...plateWithWellContents.value,
        wells: _.values(wellSpecs.value),
    }
}

const sharedWithClause = {
    storageBox: {
        columns: {
            name: true
        }
    },
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
const displayWithClause = Object.freeze({
    'amplification-primers': {
        ...sharedWithClause,
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
                },
            },
        },
    },
    'homology-arm-primers': {
        ...sharedWithClause,
    },
    'linearization-primers': {
        ...sharedWithClause,
    },
    'nucleic-acids': {
        ...sharedWithClause,
        pellet: {
            columns: {
                id: true,
                name: true,
            },
        },
    }
})

const displayWhereClause = Object.freeze({
    'or':[
        {'==':[{'var': 'wellContents'}, null]},
        {'==':[{'var': 'wellContents.well.plate.id'}, route.params.id]},
    ]
})

const sharedColumnDefs = {
    colorTile:{
        index: 0,
        header: '',
        sortable: false,
        type: 'element',
        element: (x: any) => {
            const tileColor = _.get(colorMapBySelectionTableId.value, x.id)
            return tileColor ? `<span
                class="inline-block w-6 h-6 rounded-sm text-center"
                style="color: ${getWellTextColor(tileColor)}; background-color:${tileColor}">
                ${x.sequenceType ? _.upperCase(x.sequenceType[0]) : ''}
            </span>` : ''
        },
    },
    wellContents: {
        header: 'Plate: Well',
        format: (x: any) => { return _.has(x, 'wellContents.well.plate') ? ` ${_.get(x, 'wellContents.well.plate.name')}: ${wellCoordinateToChar(x.wellContents?.well?.y)}${x.wellContents?.well?.x}` : ''},
        path: 'wellContents.displayValue',
        type: 'string',
        index: 2,
    },
    storageBoxId: {
        header: 'Storage',
        format: (x: any) => { return _.compact([_.get(x, 'storageBox.name', '') ,_.get(x, 'storageBoxLoc', '')]).join(': ')},
        path: 'storageBoxId.displayValue',
        type: 'string',
        index: 3,
    },
    storageBoxLoc: {
        display: false
    },
}
const columnDefs = {
    'amplification-primers': {
        ...sharedColumnDefs,
        name: {
            index: 1
        },
        targetId: {
            header: 'Target',
            format: (x: any) => {
                return x.target?.name || (x.target?.region ? `${_.get(x, 'target.region.gene.symbol')} : ${_.get(x, 'target.region.name')}` : '')
            },
            path: 'targetId.displayValue',
            type: 'string',
            index: 2,
        },
        project: {
            format: (x: any) => {
                return x.target?.project?.name || ''
            },
            path: 'project.displayValue',
            index: 3,
        },
    },
    'linearization-primers': {
        ...sharedColumnDefs
    },
    'homology-arm-primers': {
        ...sharedColumnDefs
    },
    'nucleic-acids': {
        ...sharedColumnDefs,
        extractionExperimentId: { display: false},
        pelletId: { display: false},
        pellet: {
            header: 'Name',
            format: (x: any) => {
                return x.pellet?.name || ''
            },
            path: 'pellet.displayValue',
            index: 1
        },
        protocol: {
            index: 4,
        }
    },
}

const wellRangeSelected = function(wells: PlateDiagramWell[]) {
    selectedWells.value = _.filter(plateWithPlateDiagramWells.value?.wells, (x) => {
        return _.includes(_.map(wells, 'id'), x.id)
    })
    toast.add({
        severity: 'info',
        summary: 'Well Range Selected',
        detail: `You selected ${wells.length} ${wells.length==1 ? 'well' : 'wells'}`,
        life: 1000,
    })
}

const selectedAllWells = function(wells: PlateDiagramWell[]) {
    selectedWells.value = wells
    toast.add({
        severity: 'info',
        summary: 'All Wells Selected',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
}
const wellSelectionCleared = function(wells: PlateDiagramWell[]) {
    selectedWells.value = []
    wells.forEach((well) => {
        well.data = null
    })
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 1000,
    })
}
const actionOnSelectedWells = function() {
    toast.add({
        severity: 'info',
        summary: 'Well action',
        detail: `You performed an action on ${selectedWells.value?.length || 0} wells`,
        life: 1000,
    })
}
const updatedWellContents = async function(newValues: PlateDiagramWell[], oldValues: PlateDiagramWell[]) {
    await refreshPlate()

    const contentSelectionTableIdsToRefresh = _.compact([
        ..._.flatten(_.map(newValues || [], (well) => { return _.compact(_.map(well.data?.wellContents, (contents) => { return _.get(contents, [wellContentsKey, 'id']) })) })),
        ..._.flatten(_.map(oldValues || [], (well) => { return _.compact(_.map(well.data?.wellContents, (contents) => { return _.get(contents, [wellContentsKey, 'id']) })) })),
    ])
    contentSelectionTableIdsToRefresh.forEach((id) => {
        contentSelectionTable.value.addOrRefreshRecordId(id)
    })
    // forces frozen records to be re-evaluated when the well contents are being cleared
    selectedWells.value = _.filter(plateWithPlateDiagramWells.value?.wells, (x) => {
        return _.includes(_.map(newValues, 'id'), x.id)
    })
}
const emptySelectedWells = async () => {
    const oldValues = _.values(_.pick(wellSpecs.value, _.map(selectedWells.value, 'id')))
    const wellContentsToDelete = _.flatten(_.compact(_.map(selectedWells.value, (x) => {
        return _.get(x, 'data.wellContents')
    })))
    const deletedRecords = await RecordService.deleteRecords(
        `${config.public.apiBase}/wellContents`,
        wellContentsToDelete
    ) as WellContent[]
    if (!_.isEmpty(deletedRecords)) {
        await refreshPlate()
        const deletedWellIds = _.uniq(_.map(deletedRecords, (deletedRecord) => deletedRecord.wellId))
        const updatedWells = _.values(_.pick(wellSpecs.value, deletedWellIds))
        plateDiagram.value.updateWells(updatedWells, oldValues)
        toast.add({
            severity: 'info',
            summary: 'Updated well',
            detail: `Emptied ${_.size(updatedWells)} wells`,
            life: 1000,
        })
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error emptying wells',
            life: 1000,
        })
    }
}
const rowActions = {
    assign: {
        label: '',
        action: async (data: any) => {
            if (_.size(selectedWells.value) != 1) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Select a single well to add contents',
                    life: 1000,
                })
            } else {
                const oldValues = selectedWells.value ? _.get(wellSpecs.value, selectedWells.value[0].id) : {}

                const newRecord = await RecordService.addRecord(
                    `${config.public.apiBase}/wellContents`,
                    {
                        wellId: _.get(selectedWells.value, [0, 'id']),
                        [_.get(PLATE_TYPE_SPECS, [plateType, 'wellContentsFK'])]: data.id,
                    }
                )
                if (newRecord?.wellId) {
                    await refreshPlate()
                    const updatedWell = _.get(wellSpecs.value, newRecord.wellId)
                    if (updatedWell) {
                        plateDiagram.value.updateWells(
                            [updatedWell],
                            [oldValues]
                        )
                    }
                    contentSelectionTable.value.addOrRefreshRecordId(data.id)
                    toast.add({
                        severity: 'info',
                        summary: 'Updated well',
                        detail: 'Well contents updated',
                        life: 1000,
                    })
                } else {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error updating well contents',
                        life: 1000,
                    })
                }
            }
        },
        icon: 'pi pi-fw pi-arrow-right',
        iconPos: 'right',
        tooltip: 'Assign to well',
        disabled: (data: any) => {
            return _.has(data, 'well.id')
        },
    },
}
</script>
<template>
    <Splitter class="h-full mb-8" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
        <SplitterPanel class="overflow-scroll" :size="60">
            <QuickTable
                v-if="tableName"
                ref="contentSelectionTable"
                :tableName="tableName"
                schemaName="select"
                :canAdd="false"
                :canDelete="false"
                :canEdit="false"
                :canExport="false"
                :withClause="_.get(displayWithClause, tableName, {})"
                :where="displayWhereClause"
                :columnDefs="_.get(columnDefs, tableName)"
                :rowActions="rowActions"
                emptyMessage=""
                v-model:frozenRecordIds="frozenRecordIds"
            />
        </SplitterPanel>
        <SplitterPanel class="flex justify-center overflow-scroll mt-10" :size="40" :minSize="25">
            <PlateDiagram
                ref="plateDiagram"
                v-if="plateWithPlateDiagramWells"
                v-model="plateWithPlateDiagramWells"
                :plateType="plateWithPlateDiagramWells.plateType"

                @well-range-selected="wellRangeSelected"
                @well-selection-cleared="wellSelectionCleared"
                @all-wells-selected="selectedAllWells"
                @well-contents-updated="updatedWellContents" >
                <template #header>
                    {{ plateWithPlateDiagramWells.name }}
                </template>
                <template #button1>
                    <Button
                        class="p-button-secondary"
                        icon="pi pi-star"
                        v-tooltip="{value: 'Action on selected wells', showDelay: 500}"
                        :disabled="_.isEmpty(selectedWells)"
                        @click="actionOnSelectedWells" />
                </template>
                <template #button2>
                    <Button
                        class="p-button-secondary"
                        icon="pi pi-trash"
                        v-tooltip="{value: 'Empty selected wells', showDelay: 500}"
                        :disabled="_.isEmpty(selectedWells)"
                        @click="emptySelectedWells" />
                </template>
            </PlateDiagram>
        </SplitterPanel>
    </Splitter>
</template>
