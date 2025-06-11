<script setup lang="ts">
import _ from 'lodash'
import { wellCoordinateToChar } from '~/lib/plate-diagram'


const { breakpoints } = useLayout()
const route = useRoute()
const plateLayout = usePlateLayout(route.params.id as string)
let sourcePlateLayout: typeof plateLayout | null
const sourcePlateWithWellSpecs = ref()
const sourcePlateDiagramKey = ref<string>()

const smallerThanLg = breakpoints.smaller('lg')
const plateWithWellSpecs = ref()
const selectionTableKey = ref(0)

const selectedSourcePlate = computed(() => {
    return plateLayout.selectionTableRef.value?.selectedRecords
})

watch (selectedSourcePlate, async (newValue) => {
    if (newValue) {
        sourcePlateLayout = usePlateLayout(newValue.id)

        if (newValue.plateType === 'preseq-2') {
            sourcePlateLayout.wellContentsDisplayConfig.value = {
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
            await sourcePlateLayout.loadPlate({
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
            })
            sourcePlateWithWellSpecs.value = {
                ...sourcePlateLayout.plateWithWellContents.value,
                wells: _.values(sourcePlateLayout.wellSpecs.value),
            }
            sourcePlateDiagramKey.value = newValue.id
        } else if (newValue.plateType === 'seq-index') {
            // TODO
        }
    } else {
        sourcePlateLayout = null
        sourcePlateWithWellSpecs.value = null
    }
})

onMounted(() => {
    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: [() => true],
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
        symbol: (well: any) => {
            return _.size(well.wellContents) || ''
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
            indexPrimer: true,
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
}

const columnDefs = {
    plateType: { display: false },
    plateTypeLabel: { header: 'Type' },
    cycleName: { display: false },
    cycleId: { display: false },
    targets: { display: false },
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
const whereClause ={
    "in": [{"var": "plateType"}, ["preseq-2", "seq-index"]]
}
</script>
<template>
    <Splitter class="h-full mb-8" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
        <SplitterPanel class="overflow-scroll" :size="60">
            <QuickTable
                :key="selectionTableKey"
                :ref="plateLayout.setSelectionTableRef"
                tableName="view-plates-with-well-counts"
                schemaName="select"
                :canAdd="false"
                :canDelete="false"
                :canEdit="false"
                :canExport="false"
                :where="whereClause"
                :columnDefs="columnDefs"
                :sortBy="['plateTypeLabel', 'name']"
                selectionMode="single"
                :showColumnFilters="true"
                emptyMessage="">
            </QuickTable>
        </SplitterPanel>
        <SplitterPanel :size="40" :minSize="25">
            <Splitter layout="vertical">
                <SplitterPanel class="flex justify-center overflow-scroll mt-10">
                    <PlateDiagram
                        :key="sourcePlateDiagramKey"
                        :ref="sourcePlateLayout.setPlateDiagramRef"
                        v-if="sourcePlateLayout && sourcePlateWithWellSpecs"
                        v-model="sourcePlateWithWellSpecs"
                        :plateType="sourcePlateWithWellSpecs.plateType"
                        :sizeX="sourcePlateWithWellSpecs.sizeX"
                        :sizeY="sourcePlateWithWellSpecs.sizeY"
                        @well-range-selected="sourcePlateLayout.wellRangeSelected"
                        @well-selection-cleared="sourcePlateLayout.wellSelectionCleared"
                        @all-wells-selected="sourcePlateLayout.selectedAllWells"
                        @well-contents-updated="sourcePlateLayout.updatedWellContents" >
                        <template #header>
                            {{ sourcePlateWithWellSpecs.name }}
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
                                :disabled="_.isEmpty(plateLayout.selectedWells)"
                                @click="plateLayout.emptySelectedWells" />
                        </template>
                    </PlateDiagram>
                </SplitterPanel>
            </Splitter>
        </SplitterPanel>
    </Splitter>
</template>
