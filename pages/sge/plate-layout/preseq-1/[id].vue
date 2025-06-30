<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, wellCoordinateToChar } from '~/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'

const { breakpoints } = useLayout()
const route = useRoute()
const plateLayout = usePlateLayout()
const toast = useToast()

const smallerThanLg = breakpoints.smaller('lg')
const plateWithWellSpecs = ref()
const pcrExperiment = ref()
const config = useRuntimeConfig()
const whereClause = ref()

onMounted(async() => {
    plateLayout.setPlateId(route.params.id as string)
    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: ['nucleicAcidId'],
        selectionTableRecordIdPaths: ['nucleicAcidId'],
        tooltip: (well: any) => {
            const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
            const nucleicAcidName = _.get(well, ['wellContents', 0, 'nucleicAcid', 'pellet', 'name'])
            return nucleicAcidName ? `${wellCoordinate}:<br>${nucleicAcidName} (DNA)` : wellCoordinate
        },
    }
    loadPlate()
})

const loadPlate = async () => {
    await plateLayout.loadPlate(
        {
            nucleicAcid: {
                with: {
                    pellet: true
                }
            },
        },
    )

    plateWithWellSpecs.value = plateLayout.plateWithPlateDiagramWells.value

    pcrExperiment.value = await RecordService.getRecord(
        `${config.public.apiBase}/pcr-experiments`,
        plateWithWellSpecs.value.pcrExperimentId as string,
        {
            transfectTarget: {
                columns: {id: true},
            }
        }
    )

    whereClause.value = {
        '==':[{'var': 'pellet.transfectTarget.id'}, pcrExperiment.value.transfectTarget.id]
    }
}

const displayWithClause = {
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
const columnDefs = {
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
            const wellCoordinates = _.map(_.filter(x.wellContents, (val) => _.get(val, 'well.plate.id') == route.params.id), (wellContent) => {
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
const rowActions = {
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
                await plateLayout.assignIdToSelectedWells(data.id, 'nucleicAcidId')
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

const layoutPreseq1 = async () => {
    const wellContentsDetected = _.some(plateLayout.plateWithWellContents.value?.wells, (well) => !_.isEmpty(well.wellContents))
    if (wellContentsDetected) {
        toast.add({ severity: 'warn', summary: 'Wells already populated', detail: 'Auto-layout requires plate to be empty', life: 3000 })
        return
    }

    let lastColumnPopulated = 0
    const allWellContentsToAdd = []

    const nucleicAcids = plateLayout.selectionTableRef.value.selectedRecords
    // should be only one negative control
    const negativeControl = _.find(nucleicAcids, (nucleicAcid) => {
        return nucleicAcid.pellet.transfections?.length == 1 && nucleicAcid.pellet.transfections[0] == 'NC'
    })

    if (negativeControl) {
        // assign to the first column (8 wells)
        const wellsToAssignTo = _.filter(plateWithWellSpecs.value.wells, (well) => well.x == 1)
        const wellContentsToAdd = _.map(wellsToAssignTo, (well) => {
            return {
                wellId: well.id,
                nucleicAcidId: negativeControl.id,
            }
        })
        allWellContentsToAdd.push(...wellContentsToAdd)
        if (!_.isEmpty(wellContentsToAdd)) lastColumnPopulated++
    }

    const dayFiveNucleicAcids = _.sortBy(_.filter(nucleicAcids, (nucleicAcid) => {
        return nucleicAcid.pellet.harvestDay == 5 && !_.includes(nucleicAcid.pellet.transfections, 'NC')
    }), (x) => x.pellet.name)

    for (const dayFiveNucleicAcid of dayFiveNucleicAcids) {
        // assign each to one column (8 wells)
        const wellsToAssignTo = _.filter(plateWithWellSpecs.value.wells, (well) => well.x == lastColumnPopulated + 1)
        const wellContentsToAdd = _.map(wellsToAssignTo, (well) => {
            return {
                wellId: well.id,
                nucleicAcidId: dayFiveNucleicAcid.id,
            }
        })
        allWellContentsToAdd.push(...wellContentsToAdd)
        if (!_.isEmpty(wellContentsToAdd)) lastColumnPopulated++
    }

    const dayThirteenNucleicAcids = _.sortBy(_.filter(nucleicAcids, (nucleicAcid) => {
        return nucleicAcid.pellet.harvestDay == 13 && !_.includes(nucleicAcid.pellet.transfections, 'NC')
    }), (x) => x.pellet.name)

    for (const dayThirteenNucleicAcid of dayThirteenNucleicAcids) {
        // assign each to 2 columns (16 wells)
        const wellsToAssignTo = _.filter(plateWithWellSpecs.value.wells, (well) => well.x > lastColumnPopulated && well.x <= lastColumnPopulated + 2)
        const wellContentsToAdd = _.map(wellsToAssignTo, (well) => {
            return {
                wellId: well.id,
                nucleicAcidId: dayThirteenNucleicAcid.id,
            }
        })
        allWellContentsToAdd.push(...wellContentsToAdd)
        if (!_.isEmpty(wellContentsToAdd)) lastColumnPopulated = lastColumnPopulated + 2
    }
    if (!_.isEmpty(allWellContentsToAdd)) {
        await plateLayout.addWellContents(allWellContentsToAdd)
    }
}
const frozenRecordIds = computed(() => {
    return _.compact(_.flatten(_.map(plateLayout.selectedWells.value, 'selectionTableRecordIds')))
})
</script>
<template>
    <Splitter class="h-full mb-8" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
        <SplitterPanel class="overflow-scroll" :size="60">
            <QuickTable
                v-if="whereClause"
                :ref="plateLayout.setSelectionTableRef"
                tableName="nucleic-acids"
                schemaName="select"
                :canAdd="false"
                :canDelete="false"
                :canEdit="false"
                :canExport="false"
                :withClause="displayWithClause"
                :where="whereClause"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                :showColumnFilters="true"
                emptyMessage=""
                v-model:frozenRecordIds="frozenRecordIds">
            </QuickTable>
        </SplitterPanel>
        <SplitterPanel class="flex justify-center overflow-scroll mt-10" :size="40" :minSize="25">
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
                        icon="pi pi-star"
                        v-tooltip="{value: 'Auto-layout', showDelay: 500}"
                        :disabled="!_.isEmpty(plateLayout.selectedWells.value) || _.isEmpty(plateLayout.selectionTableRef.value?.selectedRecords)"

                        @click="layoutPreseq1" />
                </template>
                <template #button2>
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
</template>
