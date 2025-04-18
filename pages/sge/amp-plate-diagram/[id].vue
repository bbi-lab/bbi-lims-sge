<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, VALID_WELL_COLORS, wellCoordinateToChar, type PlateDiagramWell } from '@/composables/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import type { PlateWithPlateDiagramWells } from '~/components/PlateDiagram.vue'
import type { Well, WellContent } from '~/server/db/schema/sge/well'
import type { AmplificationPrimer } from '~/server/db/schema/sge/primer'

type WellWithAmplificationPrimerContents = Well & {
    wellContents: WellContent & {
        amplificationPrimer: AmplificationPrimer
    }[]
}

// keyed on amplification primer id, with color and group (to assign same colors to forward and reverse primers)
type AmplificationPrimerColorMap = {
    [key: string]: {
        color: string
        group: string
    }
}

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()

const plateWithWells = ref()
const amplificationPrimersTable = ref()
const plateWithPlateDiagramWells: Ref<PlateWithPlateDiagramWells | undefined> = ref()
const plateDiagram = ref()
const selectedWells: Ref<PlateDiagramWell[] | undefined> = ref()
const amplificationPrimerColorMap = ref<AmplificationPrimerColorMap>({})
const frozenRecordIds = ref<string[]>([])

const updateColorMap = () => {
    // remove values from color map that are not in the plate
    _.forEach(_.keys(amplificationPrimerColorMap.value), (key) => {
        if (!_.some(plateWithWells.value.wells, (well: WellWithAmplificationPrimerContents) => well.wellContents[0]?.amplificationPrimer?.id === key)) {
            delete amplificationPrimerColorMap.value[key]
        }
    })

    // add new values to color map
    let currentColorIndex = -1
    plateWithWells.value?.wells.forEach((well: WellWithAmplificationPrimerContents) => {
        if (well.wellContents[0]?.amplificationPrimer && !_.has(amplificationPrimerColorMap.value, well.wellContents[0]?.amplificationPrimer.id)) {
            const sameGroupColor = _.find(_.values(amplificationPrimerColorMap.value), (value) => value.group === _.replace(well.wellContents[0]?.amplificationPrimer.name, /_[frFR]$/, ''))?.color
            if (!sameGroupColor) currentColorIndex += 1
            _.set(amplificationPrimerColorMap.value, well.wellContents[0]?.amplificationPrimer.id, {
                color: sameGroupColor || VALID_WELL_COLORS[currentColorIndex % VALID_WELL_COLORS.length],
                group: _.replace(well.wellContents[0]?.amplificationPrimer.name, /_[frFR]$/, '')
            })
        }
    })
}

onMounted(async() => {
    refreshPlate()
})

const refreshPlate = async () => {
    plateWithWells.value = await RecordService.getRecord(
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
                            amplificationPrimer: true,
                        }
                    },
                }
            }
        }
    )
    updateColorMap()
    const plateDiagramWells: PlateDiagramWell[] = _.map(plateWithWells.value.wells, (well: WellWithAmplificationPrimerContents) => {
        const wellContent = _.get(well.wellContents, '0.amplificationPrimer')
        const wellContentType = wellContent ? 'AMP' : null
        const wellContentTooltip = wellContent ? `${wellCoordinateToChar(well.y)}${well.x}<br>${wellContent.name} (${wellContentType})` : `${wellCoordinateToChar(well.y)}${well.x}`
        const wellColor = _.get(amplificationPrimerColorMap.value, [wellContent?.id, 'color'])

        const plateDiagramWell: PlateDiagramWell = {
            id: well.id,
            x: well.x,
            y: well.y,
            data: well,
            color: wellColor,
            symbol: well.wellContents[0]?.amplificationPrimer?.sequenceType ? _.upperCase(well.wellContents[0]?.amplificationPrimer.sequenceType[0]) : undefined,  // should be F or R
            tooltip: wellContentTooltip,
        }
        return plateDiagramWell
    })
    // replace wells from data model with plateDiagramWells to include visualization properties
    plateWithPlateDiagramWells.value = {
        ...plateWithWells.value,
        wells: plateDiagramWells,
    }
}

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
            },
        },
    },
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
})

const displayWhereClause = Object.freeze({
    'or':[
        {'==':[{'var': 'wellContents'}, null]},
        {'==':[{'var': 'wellContents.well.plate.id'}, route.params.id]},
    ]

})
const columnDefs = {
    colorTile: {
        index: 0,
        header: '',
        sortable: false,
        type: 'element',
        element: (x: any) => {
            return _.has(amplificationPrimerColorMap.value, [x.id, 'color']) ? `<span
                class="inline-block w-6 h-6 rounded-sm text-center"
                style="color: ${getWellTextColor(_.get(amplificationPrimerColorMap.value, [x.id, 'color']))}; background-color:${_.get(amplificationPrimerColorMap.value, [x.id, 'color'])}">
                ${x.sequenceType ? _.upperCase(x.sequenceType[0]) : ''}
            </span>` : ''
        },
    },
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
    storageBoxId: {
        header: 'Storage',
        format: (x: any) => { return _.compact([_.get(x, 'storageBox.name', '') ,_.get(x, 'storageBoxLoc', '')]).join(': ')},
        path: 'storageBoxId.displayValue',
        type: 'string',
        index: 4,
    },
    storageBoxLoc: {
        display: false
    },
    wellContents: {
        header: 'Plate: Well',
        format: (x: any) => { return _.has(x, 'wellContents.well.plate') ? ` ${_.get(x, 'wellContents.well.plate.name')}: ${wellCoordinateToChar(x.wellContents?.well?.y)}${x.wellContents?.well?.x}` : ''},
        path: 'wellContents.displayValue',
        type: 'string',
        index: 5,
    },
}

const wellRangeSelected = function(wells: PlateDiagramWell[]) {
    selectedWells.value = wells
    toast.add({
        severity: 'info',
        summary: 'Well Range Selected',
        detail: `You selected ${wells.length} ${wells.length==1 ? 'well' : 'wells'}`,
        life: 1000,
    })
    frozenRecordIds.value = _.map(wells, (well) => well.data.wellContents?.amplificationPrimer?.id)
}

const selectedAllWells = function(wells: PlateDiagramWell[]) {
    selectedWells.value = wells
    toast.add({
        severity: 'info',
        summary: 'All Wells Selected',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
    frozenRecordIds.value = _.map(wells, (well) => well.data?.amplificationPrimer?.id)
}
const wellSelectionCleared = function() {
    selectedWells.value = []
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 1000,
    })
    frozenRecordIds.value = []
}
const actionOnSelectedWells = function() {
    toast.add({
        severity: 'info',
        summary: 'Well action',
        detail: `You performed an action on ${selectedWells.value?.length || 0} wells`,
        life: 1000,
    })
}
const updatedWellContents = function(newValues: PlateDiagramWell[], oldValues: PlateDiagramWell[]) {
    const amplifcationPrimerIdsToRefresh = _.compact([
        ..._.map(newValues || [], (well) => { return well.data?.wellContents[0]?.amplificationPrimerId || well.data?.wellContents[0]?.amplificationPrimer?.id}),
        ..._.map(oldValues || [], (well) => { return well.data?.wellContents[0]?.amplificationPrimerId || well.data?.wellContents[0]?.amplificationPrimer?.id}),
    ])
    amplifcationPrimerIdsToRefresh.forEach((id) => {
        amplificationPrimersTable.value.addOrRefreshRecordId(id)
    })
}
const emptySelectedWells = async () => {
    const oldValues = _.cloneDeep(selectedWells.value)
    const wellContentsToDelete = _.get(selectedWells.value, '0.data.wellContents')
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
                        amplificationPrimerId: data.id,
                    }
                )
                if (newRecord?.wellId) {
                    await refreshPlate()
                    const updatedRecord = _.find(plateWithPlateDiagramWells.value?.wells, (well) => well.id === newRecord.wellId)
                    if (updatedRecord) {
                        selectedWells.value = [{
                            id: updatedRecord.id,
                            x: updatedRecord.x,
                            y: updatedRecord.y,
                            data: updatedRecord.data,
                            symbol: _.upperCase(updatedRecord.data?.wellContents[0]?.amplificationPrimer?.sequenceType?.[0]),
                            color: _.get(amplificationPrimerColorMap.value, [data.id, 'color']),
                            tooltip: `${wellCoordinateToChar(updatedRecord.y)}${updatedRecord.x}<br>${data.name} (AMP)`,
                        }]
                        plateDiagram.value.updateWellContents(
                            selectedWells.value,
                            oldValues
                        )
                    }
                    amplificationPrimersTable.value.addOrRefreshRecordId(data.id)
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
                ref="amplificationPrimersTable"
                tableName="amplification-primers"
                schemaName="select"
                :canAdd="false"
                :canDelete="false"
                :canEdit="false"
                :canExport="false"
                :withClause="displayWithClause"
                :where="displayWhereClause"
                :columnDefs="columnDefs"
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
