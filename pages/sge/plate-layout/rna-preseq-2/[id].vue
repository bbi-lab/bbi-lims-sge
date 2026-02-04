<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, wellCoordinateToChar } from '~/lib/plate-diagram'
import type { User } from '~/server/db/schema/user'
import type { Rna } from "~/server/db/schema/sge/nucleic-acid"
import type { Pellet } from "~/server/db/schema/sge/pellet"
import IxMoveLayerDown from '~icons/ix/move-layer-down'
import HugeiconsLayerSendToBack from '~icons/hugeicons/layer-send-to-back'

const { breakpoints } = useLayout()
const route = useRoute()
const plateLayout = usePlateLayout()
const toast = useToast()
const { user } = useUserSession()

const smallerThanLg = breakpoints.smaller('lg')
const plateWithWellSpecs = ref()
const config = useRuntimeConfig()
const selectionTableName = ref<'rna' | 'rna-rt-plate' | 'rna-preseq-1-plate'>('rna-rt-plate')
const selectionTableKey = ref(0)


const sourcePlateLayout = usePlateLayout()
const sourcePlateWithWellSpecs = ref()

const selectedSourcePlate = computed(() => {
    return selectionTableName.value.endsWith('-plate') ? plateLayout.selectionTableRef.value?.selectedRecords : null
})


watch (selectedSourcePlate, async (newValue) => {
    if (newValue) {
        sourcePlateLayout.setPlateId(newValue.id)


        sourcePlateLayout.wellContentsDisplayConfig.value = {
            colorBy: ['rna.id'],
            selectionTableRecordIdPaths: [(wellable: any) => {
                return _.uniq(_.values(_.map(_.get(wellable, 'wellContents.0.wellContentSources', []), (wellContentSource) => _.get(wellContentSource, 'sourceWell.plate.id'))))
            }],
            tooltip: (well: any) => {
                const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
                const rnaName = _.get(well, ['wellContents', 0, 'wellable', 'rna', 'pellet', 'name'])
                return rnaName ? `${wellCoordinate}:<br>${rnaName} (RNA)` : wellCoordinate
            },
        }
        await sourcePlateLayout.loadPlate({
            rna: {
                with: {
                    pellet: true
                }
            },
            wellContents: {
                with: {
                    wellContentSources: {
                        with: {
                            sourceWell: {
                                columns: {},
                                with: {
                                    plate: {
                                        columns: {
                                            id: true,
                                        }
                                    }
                                }
                            },
                        },
                    },
                }
            }
        })
        sourcePlateWithWellSpecs.value = {
            ...sourcePlateLayout.plateWithWellContents.value,
            wells: _.values(sourcePlateLayout.wellSpecs.value),
        }
        // sourcePlateDiagramKey.value = newValue.id
    } else {
        sourcePlateWithWellSpecs.value = null
    }
})


watch(selectionTableName, async (newValue) => {
    if (plateLayout.wellContentsDisplayConfig.value) {
        if (newValue === 'rna') {
            plateLayout.wellContentsDisplayConfig.value.selectionTableRecordIdPaths = ['rna.id']
        } else if (newValue.endsWith('-plate')) {
            plateLayout.wellContentsDisplayConfig.value.selectionTableRecordIdPaths = [(wellable: any) => {
                return _.uniq(_.values(_.map(_.get(wellable, 'wellContents.0.wellContentSources', []), (wellContentSource) => _.get(wellContentSource, 'sourceWell.plate.id'))))
            }]
        }
    }
    await loadPlate()
})

onMounted(() => {
    plateLayout.setPlateId(route.params.id as string)
    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: ['rna.id'],
        tooltip: (well: any) => {
            const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
            const rnaName = _.get(well, ['wellContents', 0, 'wellable', 'rna', 'pellet', 'name'])
            return rnaName ? `${wellCoordinate}:<br>${rnaName} (RNA)` : wellCoordinate
        },
    }
    if (selectionTableName.value === 'rna') {
        plateLayout.wellContentsDisplayConfig.value.selectionTableRecordIdPaths = ['rna.id']
    } else if (selectionTableName.value.endsWith('-plate')) {
        plateLayout.wellContentsDisplayConfig.value.selectionTableRecordIdPaths = [(wellable: any) => {
            return _.uniq(_.values(_.map(_.get(wellable, 'wellContents.0.wellContentSources', []), (wellContentSource) => _.get(wellContentSource, 'sourceWell.plate.id'))))
        }]
    }
    loadPlate()
})

const loadPlate = async () => {
    await plateLayout.loadPlate(
        {
            rna: {
                with: {
                    pellet: true
                }
            },
            wellContents: {
                with: {
                    wellContentSources: {
                        with: {
                            sourceWell: {
                                columns: {},
                                with: {
                                    plate: {
                                        columns: {
                                            id: true,
                                        }
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    )

    plateWithWellSpecs.value = {
        ...plateLayout.plateWithWellContents.value,
        wells: _.values(plateLayout.wellSpecs.value),
    }
}

const displayWithClause = computed(() => {
    if (selectionTableName.value === 'rna') {
        return {
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
            pellet: {
                columns: {
                    id: true,
                    name: true,
                    transfections: true,
                    harvestDay: true,
                },
                with: {
                    transfectTarget: {
                        columns: {id: true},
                        with: {
                            experiment: {
                                columns: {},
                                with: {
                                    cycle: {
                                        columns: {
                                            id: true,
                                            name: true,
                                        },
                                    }
                                }
                            }
                        }
                    }
                }
            },
        }
    } else {
        return {}
    }
})
const columnDefs = computed(() => {
    if (selectionTableName.value.endsWith('-plate')) {
        return {
            plateType: { display: false },
            plateTypeLabel: { header: 'Type' },
            cycleName: { header: 'Cycle' },
            cycleId: { display: false },
            pcrExperimentId: { display: false },
            sgRnaCloningExperimentId: { display: false },
            sizeX: { display: false },
            sizeY: { display: false },
            wellsCount: { display: false },
            wellsWithContentCount: { display: false },
            wellsProcessedCount: {
                header: 'Wells processed',
                format: (data: any) => {
                    return data.wellsProcessedCount || ''
                },
                path: 'wellsProcessedCount.displayValue',
            },
            filled: {
                format: (data: any) => {
                    if (data.wellsCount - data.wellsWithContentCount) {
                        return `${data.wellsWithContentCount} / ${data.wellsCount}`
                    } else {
                        return '-'
                    }
                },
                path: 'filled.displayValue',
            },
        }
    } else if (selectionTableName.value === 'rna') {
        return {
            colorTile:{
                index: 0,
                header: '',
                sortable: false,
                type: 'element',
                element: (x: any) => {
                    const wellSpec = plateLayout.getWellSpecBySelectionTableRecordId(x.id)
                    return wellSpec ? `<span
                        class="inline-block w-6 h-6 rounded-sm text-center"
                        style="color: ${getWellTextColor(wellSpec.color)}; background-color:${wellSpec.color}">
                        ${wellSpec.symbol}
                    </span>` : ''
                },
                searchable: false,
                exportable: false,
            },
            wellContents: {
                header: 'Wells',
                format: (x: any) => {
                    const wellCoordinates = _.map(_.filter(x.wellable?.wellContents || [], (val) => _.get(val, 'well.plate.id') == route.params.id), (wellContent) => {
                        return {x: wellContent.well.x, y: wellContent.well.y,}
                    })
                    const contentsGroupedByX = _.groupBy(wellCoordinates, 'x')
                    const yRanges = _.mapValues(contentsGroupedByX, (coordinates) => {
                        const sortedByY = _.sortBy(coordinates, 'y')
                        const consecutiveYRanges = _.reduce(sortedByY, (acc, coordinate) => {
                            if (acc.length === 0 || acc[acc.length - 1].maxY + 1 < coordinate.y) {
                                acc.push({ x: coordinate.x, minY: coordinate.y, maxY: coordinate.y })
                            } else {
                                acc[acc.length - 1].maxY = Math.max(acc[acc.length - 1].maxY, coordinate.y)
                            }
                            return acc
                        }, [] as Array<{ x: number; minY: number; maxY: number }>)
                        return consecutiveYRanges
                    })
                    return _.map(_.flatten(_.values(yRanges)), (val) => {
                        return val.minY == val.maxY ? `${wellCoordinateToChar(val.minY)}${val.x}` : `${wellCoordinateToChar(val.minY)}${val.x}-${wellCoordinateToChar(val.maxY)}${val.x}`
                    }).join(', ')
                },
                path: 'wellContents.displayValue',
                type: 'string',
                index: 2,
            },
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
            cycle: {
                header: 'Cycle',
                format: (x: any) => {
                    return x.pellet?.transfectTarget?.experiment?.cycle?.name || ''
                },
                path: 'cycle.displayValue',
                index: 1
            },
            protocol: {
                index: 4,
            }
        }
    } else {
        return {}
    }
})

const rowActions = computed(() => {
    if (selectionTableName.value == 'rna') {
        return {
            assign: {
                label: '',
                action: async (data: any) => {
                    if (plateLayout.selectedWells.value.length === 0) {
                        toast.add({ severity: 'warn', summary: 'No wells selected', detail: 'Please select well(s) to fill.', life: 3000 })
                        return
                    } else if (_.some(plateLayout.selectedWells.value, (x) => !_.isEmpty(x.data.wellContents))) {
                        toast.add({ severity: 'warn', summary: 'Well already has contents', detail: 'Please select empty wells only.', life: 3000 })
                        return
                    } else {
                        await plateLayout.assignIdToSelectedWells(data.id)
                    }
                },
                icon: 'pi pi-fw pi-arrow-right',
                iconPos: 'right',
                tooltip: 'Assign to selected wells',
                disabled: (data: any) => {
                    return _.has(data, 'wellContents.well.id')
                },
            },
        }
    } else {
        return {}
    }
})

const selectionTableOptions = [
    { label: 'RNA RT plates', value: 'rna-rt-plate' },
    { label: 'RNA PreSeq 1 plates', value: 'rna-preseq-1-plate' },
    { label: 'RNA samples', value: 'rna' },
]
watch(selectionTableName, (newValue, oldValue) => {
    if (newValue != oldValue) {
        selectionTableKey.value += 1
        plateLayout.selectionTableRef.value.selection = []
    }
})
const whereClause = computed(() => {
    return (selectionTableName.value === 'rna-rt-plate') ? {"==": [{"var": "plateType"}, "rna-rt"]} : (selectionTableName.value === 'rna-preseq-1-plate') ? {"==": [{"var": "plateType"}, "rna-preseq-1"]} : {}
})
const frozenRecordIds = computed(() => {
    return _.compact(_.flatten(_.map(plateLayout.selectedWells.value, 'selectionTableRecordIds')))
})

const transferSelectedWellsContents = async () => {
    const sourceWells = sourcePlateLayout!.selectedWells.value
    const destinationWells = plateLayout.selectedWells.value

    if (_.isEmpty(sourceWells)) {
        toast.add({severity: 'warn', summary: 'No wells selected for transfer', life: 3000})
    } else if (sourceWells.length !== destinationWells.length) {
        toast.add({severity: 'warn', summary: 'Number of selected wells in source plate does not match number of selected wells in destination plate', life: 3000})
    } else {
        const sourceWellsSorted = _.sortBy(sourceWells, ['x', 'y'])
        const destinationWellsSorted = _.sortBy(destinationWells, ['x', 'y'])

        const wellContentsToAdd = _.flatten(_.map(sourceWellsSorted, (well, index) => {
            const wellContents = well.data.wellContents
            const destinationWell = destinationWellsSorted[index]
            return _.map(wellContents, (wellContent) => {
                return {
                    wellableId: wellContent.wellableId,
                    wellId: destinationWell.id,
                    sourceWellIds: [well.id],
                    createdBy: (user.value as User)?.id,
                }
            })
        }))
        await plateLayout.addWellContents(wellContentsToAdd.flat())
    }
}


const poolSelectedWellsContents = async () => {
    const sourceWells = sourcePlateLayout!.selectedWells.value
    const destinationWells = plateLayout.selectedWells.value

    if (_.isEmpty(sourceWells)) {
        toast.add({severity: 'warn', summary: 'No wells selected for transfer', life: 3000})
    } else {

        let recordsToAdd: {
            wellId: string;
            wellableId: string;
            sourceWellIds: String[];
            createdBy: string | null;
        }[]

        type RnaWithPellet = Rna & {pellet: Pellet}
        type RnaWithPelletAndWellIds = RnaWithPellet & {wellIds: String[]}

        // sort wells by x and inverse y coordinate to achieve the correct order
        const sourceWellsSorted = _.sortBy(sourceWells, (well) => `${_.padStart(_.toString(well.x), 2, '0')}_${(_.toString(100-well.y))}`)
        const destinationWellsSorted = _.sortBy(destinationWells, (well) => `${_.padStart(_.toString(well.x), 2, '0')}_${(_.toString(100-well.y))}`)

        console.log('sourceWellsSorted:', sourceWellsSorted)
        const pooledRna = _.sortBy(_.values(sourceWells.reduce((acc, well) => {
            const rna = _.get(well, ['data', 'wellContents', 0, 'wellable', 'rna'])
            if (rna?.id) {
                const existingWellIds = _.get(acc, [rna.id, 'wellIds'], [])
                _.set(acc, rna.id, {...rna, wellIds: [...existingWellIds, well.id]})
            }
            return acc
        }, {})), (x) => {
            return x.pellet.name
        }) as RnaWithPelletAndWellIds[]

        if (pooledRna.length > destinationWellsSorted.length) {
            toast.add({severity: 'warn', summary: 'Number of destination wells is less than number of selected RNA', life: 3000})
            return
        } else {
            const wellContentsAndSources = _.map(pooledRna, (value, index) => {
                const userId = (user.value as User)?.id || null
                return {
                    wellId: destinationWellsSorted[index].id,
                    wellableId: value.id,
                    sourceWellIds: value.wellIds,
                    createdBy: userId,
                }
            })
            recordsToAdd = wellContentsAndSources
        }
        await plateLayout.addWellContents(recordsToAdd)
    }
}

</script>
<template>
    <Splitter class="h-full mb-8" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
        <SplitterPanel class="overflow-scroll" :size="60">
            <QuickTable
                :key="selectionTableKey"
                :ref="plateLayout.setSelectionTableRef"
                :tableName="selectionTableName.endsWith('-plate') ? 'view-plates-with-well-counts' : selectionTableName"
                schemaName="select"
                :canAdd="false"
                :canDelete="false"
                :canEdit="false"
                :canExport="false"
                :where="whereClause"
                :columnDefs="columnDefs"
                :withClause="displayWithClause"
                :rowActions="rowActions"
                :showColumnFilters="true"
                :selectionMode="selectionTableName.endsWith('-plate') ? 'single' : 'multiple'"
                emptyMessage=""
                v-model:frozenRecordIds="frozenRecordIds">
                <template #header-buttons>
                    <SelectButton class="record-type-select" v-model="selectionTableName" :options="selectionTableOptions" optionLabel="label" optionValue="value" dataKey="label" />
                </template>
            </QuickTable>
        </SplitterPanel>
        <SplitterPanel :size="40" :minSize="25">
            <Splitter layout="vertical">
                <SplitterPanel v-if="selectionTableName.endsWith('-plate')" class="flex justify-center overflow-scroll mt-10">
                    <PlateDiagram
                        :ref="sourcePlateLayout?.setPlateDiagramRef"
                        v-if="selectedSourcePlate?.id && sourcePlateWithWellSpecs"
                        v-model="sourcePlateWithWellSpecs"
                        :plateType="sourcePlateWithWellSpecs.plateType"
                        :sizeX="sourcePlateWithWellSpecs.sizeX"
                        :sizeY="sourcePlateWithWellSpecs.sizeY"
                        @well-range-selected="sourcePlateLayout?.wellRangeSelected"
                        @well-selection-cleared="sourcePlateLayout?.wellSelectionCleared"
                        @all-wells-selected="sourcePlateLayout?.selectedAllWells"
                        @well-contents-updated="sourcePlateLayout?.updatedWellContents" >
                        <template #header>
                            {{ sourcePlateWithWellSpecs.name }}
                        </template>
                        <template #button1>
                            <Button
                                severity="secondary"
                                v-tooltip="{value: sourcePlateWithWellSpecs.plateType === 'rna-rt' ? 'Pool selected wells to PreSeq 2 plate' : 'Transfer selected wells to PreSeq 2 plate', showDelay: 500}"
                                :disabled="_.isEmpty(sourcePlateLayout?.selectedWells.value)"
                                @click="() => {sourcePlateWithWellSpecs.plateType === 'rna-rt' ? poolSelectedWellsContents() : transferSelectedWellsContents()}" >
                                <template #icon>
                                    <HugeiconsLayerSendToBack v-if="sourcePlateWithWellSpecs.plateType === 'rna-rt'" />
                                    <IxMoveLayerDown v-else />
                                </template>
                            </Button>
                        </template>
                    </PlateDiagram>
                    <div v-else>
                        <span class="text-gray-500">No source plate selected</span>
                    </div>
                </SplitterPanel>
                <SplitterPanel class="flex justify-center overflow-scroll mt-10">
                    <PlateDiagram
                        :ref="plateLayout.setPlateDiagramRef"
                        v-if="plateWithWellSpecs"
                        v-model="plateWithWellSpecs"
                        :plateType="plateWithWellSpecs.plateType"
                        :sizeX="plateWithWellSpecs.sizeX"
                        :sizeY="plateWithWellSpecs.sizeY"
                        @well-range-selected="plateLayout.wellRangeSelected"
                        @well-selection-cleared="plateLayout.wellSelectionCleared"
                        @all-wells-selected="plateLayout.selectedAllWells"
                        @well-contents-updated="plateLayout.updatedWellContents" >
                        <template #header>
                            {{ plateWithWellSpecs.name }}
                        </template>
                        <template #button1>
                            <Button
                                class="p-button-secondary"
                                icon="pi pi-trash"
                                v-tooltip="{value: 'Empty selected wells', showDelay: 500}"
                                :disabled="_.isEmpty(plateLayout.selectedWells.value)"
                                @click="plateLayout.emptySelectedWells" />
                        </template>
                    </PlateDiagram>
                </SplitterPanel>
            </Splitter>
        </SplitterPanel>
    </Splitter>
</template>

<style scoped>
.record-type-select :deep(.p-togglebutton.p-togglebutton-checked::before) {
    background-color: theme('colors.orange.500');
}
.record-type-select :deep(.p-togglebutton.p-togglebutton-checked .p-togglebutton-label) {
    color: theme('colors.white');
}
</style>
