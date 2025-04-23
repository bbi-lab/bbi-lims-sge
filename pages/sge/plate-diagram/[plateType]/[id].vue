<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, wellCoordinateToChar, type PlateDiagramWell } from '@/composables/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import type { PlateWithPlateDiagramWells } from '~/components/PlateDiagram.vue'
import type { WellContent } from '~/server/db/schema/sge/well'
import { type PlateWithWellContents, type PlateDiagramColorMap, updateColorMap } from '~/utils/sge/plateUtils'
import { type AmplificationPrimer, type HomologyArmPrimer, type LinearizationPrimer } from '~/server/db/schema/sge/primer'
import type { NucleicAcid } from '~/server/db/schema/sge/nucleic-acid'
import { PLATE_TYPE_SPECS } from '~/utils/sge/plateUtils'
import type { Pellet } from '~/server/db/schema/sge/pellet'

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()

const plateWithWellContents = ref<PlateWithWellContents>()
const contentSelectionTable = ref()
const plateWithPlateDiagramWells = ref<PlateWithPlateDiagramWells>()
const plateDiagram = ref()
const selectedWells = ref<PlateDiagramWell[]>()
const plateDiagramColorMap = ref<PlateDiagramColorMap>({})
const tableName = ref<string | null>(null)

const frozenRecordIds = computed(() => {
    return _.compact(_.map(selectedWells.value, (well) => {
        const wellContentsKey = _.get(PLATE_TYPE_SPECS, [plateType, 'wellContentsKey'])
        return _.get(well.data, ['wellContents', 0, wellContentsKey, 'id'])
    }))
})
const plateType = route.params.plateType as 'amp-storage' | 'lin-storage' | 'ha-storage' | 'pcr-1' | 'pcr-2' | 'pcr-3'

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
                            nucleicAcid: route.params.plateType == 'pcr-1' ? {with: {pellet: true}} : false,
                        }
                    },
                }
            }
        }
    )
    if (_.isEmpty(plateWithWellContents.value)) return

    tableName.value = _.get(PLATE_TYPE_SPECS, [plateType, 'selectionTableName'])
    updateColorMap(plateDiagramColorMap.value, plateWithWellContents.value)
    const plateDiagramWells: PlateDiagramWell[] = _.map(plateWithWellContents.value.wells, (well) => {
        let wellContent: AmplificationPrimer | LinearizationPrimer | HomologyArmPrimer | NucleicAcid & {pellet: Pellet} | undefined
        let wellSymbol
        const wellContentTypeShortName = _.get(PLATE_TYPE_SPECS, [plateType, 'wellContentTypeShortName'])

        // TODO - handle wells with multiple contents
        wellContent = _.get(well, ['wellContents', 0, _.get(PLATE_TYPE_SPECS, [plateType, 'wellContentsKey'])])
        const wellContentName = tableName.value == 'nucleic-acids' ? wellContent?.pellet?.name : wellContent?.name

        if (route.params.plateType == 'amp-storage') {
            wellSymbol = _.upperCase(_.get(wellContent, 'sequenceType.0'))
        } else if (route.params.plateType == 'lin-storage') {
            wellSymbol = _.upperCase(_.get(wellContent, 'sequenceType.0'))
        } else if (route.params.plateType == 'ha-storage') {
            wellSymbol = _.upperCase(_.get(wellContent, 'sequenceType.0'))
        }

        const wellContentTooltip = wellContent ? `${wellCoordinateToChar(well.y)}${well.x}<br>${wellContentName} (${wellContentTypeShortName})` : `${wellCoordinateToChar(well.y)}${well.x}`
        const wellColor = wellContent ? _.get(plateDiagramColorMap.value, [wellContent?.id, 'color']) : undefined

        const plateDiagramWell: PlateDiagramWell = {
            id: well.id,
            x: well.x,
            y: well.y,
            data: well,
            color: wellColor,
            symbol: wellSymbol,  // should be F or R for amplification primers
            tooltip: wellContentTooltip,
        }
        return plateDiagramWell as PlateDiagramWell
    })
    // replace wells from data model with plateDiagramWells to include visualization properties
    plateWithPlateDiagramWells.value = {
        ...plateWithWellContents.value,
        wells: plateDiagramWells,
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
            return _.has(plateDiagramColorMap.value, [x.id, 'color']) ? `<span
                class="inline-block w-6 h-6 rounded-sm text-center"
                style="color: ${getWellTextColor(_.get(plateDiagramColorMap.value, [x.id, 'color']))}; background-color:${_.get(plateDiagramColorMap.value, [x.id, 'color'])}">
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
    const wellContentsKey = _.get(PLATE_TYPE_SPECS, [plateType, 'wellContentsKey'])
    const contentSelectionTableIdsToRefresh = _.compact([
        ..._.map(newValues || [], (well) => { return well.data?.wellContents[0]?.[wellContentsKey]?.id }),
        ..._.map(oldValues || [], (well) => { return well.data?.wellContents[0]?.[wellContentsKey]?.id }),
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
    const oldValues = _.cloneDeep(selectedWells.value)
    const wellContentsToDelete = _.compact(_.map(selectedWells.value, (x) => {
        return _.get(x, 'data.wellContents.0')
    }))
    const deletedRecords = await RecordService.deleteRecords(
        `${config.public.apiBase}/wellContents`,
        wellContentsToDelete
    ) as WellContent[]
    if (!_.isEmpty(deletedRecords)) {
        await refreshPlate()
        const deletedWellIds = _.uniq(_.map(deletedRecords, (deletedRecord) => deletedRecord.wellId))
        const updatedWells = _.filter(plateWithPlateDiagramWells.value?.wells, (well) => {
            return _.includes(deletedWellIds, well.id)
        })
        plateDiagram.value.updateWellContents(
            _.map(updatedWells || [], (updatedWell) => {
                return {
                    id: updatedWell.id,
                    x: updatedWell.x,
                    y: updatedWell.y,
                    data: updatedWell.data,
                    color: null,
                    symbol: undefined,
                    tooltip: `${wellCoordinateToChar(updatedWell.y)}${updatedWell.x}`,
                }
            }),
            oldValues
        )
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
                const oldValues = _.cloneDeep(selectedWells.value)
                const newRecord = await RecordService.addRecord(
                    `${config.public.apiBase}/wellContents`,
                    {
                        wellId: _.get(selectedWells.value, [0, 'id']),
                        [_.get(PLATE_TYPE_SPECS, [plateType, 'wellContentsFK'])]: data.id,
                    }
                )
                if (newRecord?.wellId) {
                    await refreshPlate()
                    const updatedWell = _.find(plateWithWellContents.value?.wells, (well) => well.id === newRecord.wellId)
                    if (updatedWell) {
                        const wellContentTypeShortName = _.get(PLATE_TYPE_SPECS, [plateType, 'wellContentTypeShortName'])
                        let wellSymbol
                        if (_.includes(['amp-storage', 'lin-storage', 'ha-storage'], plateType)) {
                            const wellContentsKey = _.get(PLATE_TYPE_SPECS, [plateType, 'wellContentsKey'])
                            wellSymbol = _.upperCase(_.get(updatedWell, ['wellContents', 0, wellContentsKey, 'sequenceType', 0]))
                        }
                        const wellContentName = tableName.value == 'nucleic-acids' ? data.pellet?.name : data.name
                        selectedWells.value = [{
                            id: updatedWell.id,
                            x: updatedWell.x,
                            y: updatedWell.y,
                            data: updatedWell,
                            symbol: wellSymbol,
                            color: _.get(plateDiagramColorMap.value, [data.id, 'color']),
                            tooltip: `${wellCoordinateToChar(updatedWell.y)}${updatedWell.x}<br>${wellContentName} (${wellContentTypeShortName})`,
                        }]
                        plateDiagram.value.updateWellContents(
                            selectedWells.value,
                            oldValues
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
    <Splitter class="h-full mb-8">
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
