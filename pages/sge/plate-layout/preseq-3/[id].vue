<script setup lang="ts">
import _ from 'lodash'
import { wellCoordinateToChar } from '~/lib/plate-diagram'
import type { User } from '~/server/db/schema/user';
import IxMoveLayerDown from '~icons/ix/move-layer-down';

const { breakpoints } = useLayout()
const route = useRoute()
const plateLayout = usePlateLayout()
const sourcePlateLayout = usePlateLayout()
const sourcePlateWithWellSpecs = ref()
// const sourcePlateDiagramKey = ref<string>()
const toast = useToast()
const { user } = useUserSession()

const smallerThanLg = breakpoints.smaller('lg')
const plateWithWellSpecs = ref()
const selectionTableKey = ref(0)

const selectedSourcePlate = computed(() => {
    return plateLayout.selectionTableRef.value?.selectedRecords
})

watch (selectedSourcePlate, async (newValue) => {
    if (newValue) {
        sourcePlateLayout.setPlateId(newValue.id)

        if (newValue.plateType === 'preseq-2') {
            sourcePlateLayout.wellContentsDisplayConfig.value = {
                colorBy: ['nucleicAcid.id'],
                selectionTableRecordIdPaths: [(wellable: any) => {
                    return _.uniq(_.values(_.map(_.get(wellable, 'wellContents.0.wellContentSources', []), (wellContentSource) => _.get(wellContentSource, 'sourceWell.plate.id'))))
                }],
                syncedPlateWellSpecs: plateLayout.wellSpecs,
                tooltip: (well: any) => {
                    const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
                    const nucleicAcidName = _.get(well, ['wellContents', 0, 'wellable', 'nucleicAcid', 'pellet', 'name'])
                    return nucleicAcidName ? `${wellCoordinate}:<br>${nucleicAcidName} (DNA)` : wellCoordinate
                },
            }
            await sourcePlateLayout.loadPlate({
                nucleicAcid: {
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
        } else if (newValue.plateType === 'seq-index') {
            sourcePlateLayout.wellContentsDisplayConfig.value = {
                colorBy: [() => true],
                selectionTableRecordIdPaths: ['wellContents.0.well.plateId'],
                syncedPlateWellSpecs: plateLayout.wellSpecs,
                tooltip: (well: any) => {
                    const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
                    const indexPrimers = _.map(well.wellContents, 'wellable.indexPrimer')
                    return indexPrimers ? `${wellCoordinate}:<br>` + _.map(indexPrimers, (indexPrimer) => `${indexPrimer.indexSequence} (${indexPrimer.primerType} INDEX)`).join('<br>') : wellCoordinate
                },
                symbol: (well: any) => {
                    const primerDirection = _.get(well, ['wellContents', 0, 'wellable', 'indexPrimer', 'sequenceType'])
                    return primerDirection ? _.upperCase(primerDirection[0]) : ''
                },
            }
            await sourcePlateLayout.loadPlate({
                indexPrimer: true,
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
        }
        sourcePlateWithWellSpecs.value = {
            ...sourcePlateLayout.plateWithWellContents.value,
            wells: _.values(sourcePlateLayout.wellSpecs.value),
        }
        // sourcePlateDiagramKey.value = newValue.id
    } else {
        sourcePlateWithWellSpecs.value = null
    }
})

onMounted(() => {
    plateLayout.setPlateId(route.params.id as string)
    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: [() => true],
        syncedPlateWellSpecs: sourcePlateLayout.wellSpecs,
        selectionTableRecordIdPaths: [(wellable: any) => {
            return _.uniq(_.values(_.map(_.get(wellable, 'wellContents.0.wellContentSources', []), (wellContentSource) => _.get(wellContentSource, 'sourceWell.plate.id'))))
        }],
        tooltip: (well: any) => {
            const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
            const wellContentsText = _.map(well.wellContents, (wellContent) => {
                const nucleicAcid = wellContent?.wellable?.nucleicAcid
                if (nucleicAcid) {
                    return nucleicAcid.pellet ? `${nucleicAcid.pellet.name} (DNA)` : '?? (DNA)'
                } else if (wellContent?.wellable?.indexPrimer) {
                    return `${wellContent.wellable.indexPrimer.indexSequence} (${wellContent.wellable.indexPrimer.primerType} INDEX)`
                } else {
                    return ''
                }
            }).join('<br>')
            return wellContentsText ? `${wellCoordinate}:<br>${wellContentsText}` : wellCoordinate
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
            },
        },
    )

    plateWithWellSpecs.value = {
        ...plateLayout.plateWithWellContents.value,
        wells: _.values(plateLayout.wellSpecs.value),
    }
}

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
                    wellId: destinationWell.id,
                    sourceWellIds: [well.id],
                    wellableId: wellContent.wellableId,
                    createdBy: (user.value as User)?.id,
                }
            })
        }))
        await plateLayout.addWellContents(wellContentsToAdd.flat())
    }
}

const columnDefs = {
    plateType: { display: false },
    // snvLibCloningExperimentId: { display: false },
    sgRnaCloningExperimentId: { display: false },
    plateTypeLabel: { header: 'Type' },
    cycleName: { display: false },
    cycleId: { display: false },
    targets: { display: false },
    pcrExperimentId: { display: false},
    plasmidExperimentId: { display: false},
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
const frozenRecordIds = computed(() => {
    return _.compact(_.concat(_.flatten(_.map(plateLayout.selectedWells.value, 'selectionTableRecordIds')), selectedSourcePlate.value?.id))
})
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
                :rowsPerPageOptions="[10, 25, 50, 100]"
                emptyMessage=""
                v-model:frozenRecordIds="frozenRecordIds">
            </QuickTable>
        </SplitterPanel>
        <SplitterPanel :size="40" :minSize="25">
            <Splitter layout="vertical">
                <SplitterPanel class="flex justify-center overflow-scroll mt-10">
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
                                v-tooltip="{value: 'Transfer well contents to PreSeq 3 plate', showDelay: 500}"
                                :disabled="_.isEmpty(sourcePlateLayout?.selectedWells.value)"
                                @click="transferSelectedWellsContents">
                                <template #icon>
                                    <IxMoveLayerDown />
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
