<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, wellCoordinateToChar } from '~/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'

const { breakpoints } = useLayout()
const route = useRoute()
const plateLayout = usePlateLayout(route.params.id as string)
const toast = useToast()

const smallerThanLg = breakpoints.smaller('lg')
const plateWithWellSpecs = ref()
const pcrExperiment = ref()
const config = useRuntimeConfig()
const selectionTableName = ref<string>('view-plates-with-well-counts')
const selectionTableKey = ref(0)

watch(selectionTableName, async (newValue) => {
    if (plateLayout.wellContentsDisplayConfig.value) {
        if (newValue === 'nucleic-acids') {
            plateLayout.wellContentsDisplayConfig.value.selectionTableRecordIdPaths = ['nucleicAcidId']
        } else if (newValue === 'view-plates-with-well-counts') {
            plateLayout.wellContentsDisplayConfig.value.selectionTableRecordIdPaths = [(x: any) => {
                return _.uniq(_.map(x.wellContentSources, (wellContentSource) => {
                    return _.get(wellContentSource, 'sourceWell.plate.id')
                }))
            }]
        }
    }
    await loadPlate()
})

onMounted(() => {
    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: ['nucleicAcidId'],
        selectionTableRecordIdPaths: [(x: any) => {
            return _.uniq(_.map(x.wellContentSources, (wellContentSource) => {
                return _.get(wellContentSource, 'sourceWell.plate.id')
            }))
        }],
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
        },
    )

    plateWithWellSpecs.value = {
        ...plateLayout.plateWithWellContents.value,
        wells: _.values(plateLayout.wellSpecs.value),
    }

    pcrExperiment.value = await RecordService.getRecord(
        `${config.public.apiBase}/pcr-experiments`,
        plateWithWellSpecs.value.pcrExperimentId as string,
        {
            transfectTarget: {
                columns: {id: true},
            }
        }
    )
}

const displayWithClause = computed(() => {
    if (selectionTableName.value === 'nucleic-acids') {
        return {
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
    } else {
        return {}
    }
})
const columnDefs = computed(() => {
    if (selectionTableName.value === 'view-plates-with-well-counts') {
        return {
            plateType: { display: false },
            plateTypeLabel: { header: 'Type' },
            cycleName: { header: 'Cycle' },
            cycleId: { display: false },
            pcrExperimentId: { display: false},
            sizeX: { display: false },
            sizeY: { display: false },
            wellsCount: { display: false },
            wellsWithContentCount: { display: false },
            wellsProcessedCount: {
                header: 'Wells processed',
                format: (data: any) => {
                    return _.includes(['preseq-1', 'preseq-2'], data.plateType) ? data.wellsProcessedCount : ''
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
    } else if (selectionTableName.value === 'nucleic-acids') {
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
    } else {
        return {}
    }
})

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
                if (selectionTableName.value === 'nucleic-acids') {
                    await plateLayout.assignIdToSelectedWells(data.id, 'nucleicAcidId')
                } else if (selectionTableName.value === 'view-plates-with-well-counts') {
                    await plateLayout.poolPreSeq1PlateToSelectedWells(data.id)
                }
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
const selectionTableOptions = ref([
    { label: 'Plates', value: 'view-plates-with-well-counts' },
    { label: 'DNA', value: 'nucleic-acids' },
])
watch(selectionTableName, (newValue, oldValue) => {
    if (newValue != oldValue) {
        selectionTableKey.value += 1
        plateLayout.selectionTableRef.value.selection = []
    }
})
const whereClause = computed(() => {
    return (selectionTableName.value === 'view-plates-with-well-counts') ? {"==": [{"var": "plateType"}, "preseq-1"]} : {}
})
</script>
<template>
    <Splitter class="h-full mb-8" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
        <SplitterPanel class="overflow-scroll" :size="60">
            <QuickTable
                :key="selectionTableKey"
                :ref="plateLayout.setSelectionTableRef"
                :tableName="selectionTableName"
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
                emptyMessage="">
                <template #header-buttons>
                    <SelectButton v-model="selectionTableName" :options="selectionTableOptions" optionLabel="label" optionValue="value" dataKey="label" />
                </template>
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
                        icon="pi pi-trash"
                        v-tooltip="{value: 'Empty selected wells', showDelay: 500}"
                        :disabled="_.isEmpty(plateLayout.selectedWells)"
                        @click="plateLayout.emptySelectedWells" />
                </template>
            </PlateDiagram>
        </SplitterPanel>
    </Splitter>
</template>
