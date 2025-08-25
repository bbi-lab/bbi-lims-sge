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
        colorBy: ['snvLibPlasmid.id'],
        selectionTableRecordIdPaths: ['snvLibPlasmid.id'],
        tooltip: (well: any) => {
            const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
            const plasmidName = _.get(well, ['wellContents', 0, 'wellable', 'snvLibPlasmid', 'name'])
            return plasmidName ? `${wellCoordinate}:<br>${plasmidName} (plasmid)` : plasmidName
        },
    }
    loadPlate()
})

const loadPlate = async () => {
    await plateLayout.loadPlate(
        {
            snvLibPlasmid: true,
        },
    )

    plateWithWellSpecs.value = {
        ...plateLayout.plateWithWellContents.value,
        wells: _.values(plateLayout.wellSpecs.value),
    }

    pcrExperiment.value = await RecordService.getRecord(
        `${config.public.apiBase}/pcr-experiments`,
        plateWithWellSpecs.value.pcrExperimentId as string,
        {}
    )
}

const displayWithClause = {
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
    target: {
        columns: {
            name: true
        },
    },
    snvLibCloningExperiment: {
        columns: {
            name: true
        },
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
    targetId: {
        display: false,
    },
    target: {
        format: (x: any) => {
            return x.target ? x.target.name : ''
        },
        path: 'target.displayValue',
        index: 1,
    },
    snvLibCloningExperimentId: {
        display: false,
    },
    snvLibCloningExperiment: {
        header: 'SNV-lib Cloning Experiment',
        format: (x: any) => {
            return x.snvLibCloningExperiment ? x.snvLibCloningExperiment.name : ''
        },
        path: 'snvLibCloningExperiment.displayValue',
    },
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

const frozenRecordIds = computed(() => {
    return _.compact(_.flatten(_.map(plateLayout.selectedWells.value, 'selectionTableRecordIds')))
})
</script>
<template>
    <Splitter class="h-full mb-8" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
        <SplitterPanel class="overflow-scroll" :size="60">
            <QuickTable
                :ref="plateLayout.setSelectionTableRef"
                tableName="snv-lib-plasmids"
                schemaName="select"
                :canAdd="false"
                :canDelete="false"
                :canEdit="false"
                :canExport="false"
                :withClause="displayWithClause"
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
