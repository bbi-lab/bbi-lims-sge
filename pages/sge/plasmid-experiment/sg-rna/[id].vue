<script setup lang="ts">
import _ from 'lodash'
import { wellCoordinateToChar } from '~/lib/plate-diagram'
import type { User } from '~/server/db/schema/user';
import { RecordService } from '~/utils/service/RecordService'
import IxMoveLayerDown from '~icons/ix/move-layer-down'

const { breakpoints } = useLayout()
const route = useRoute()
const plateLayout = usePlateLayout()
const sourcePlateLayout = usePlateLayout()
const sourcePlateWithWellSpecs = ref()
const toast = useToast()
const { user } = useUserSession()
const config = useRuntimeConfig()

const smallerThanLg = breakpoints.smaller('lg')
const plateWithWellSpecs = ref()
const selectionTableKey = ref(0)
const sgRnaCloningExperiment = ref()

const selectedSourcePlate = computed(() => {
    return plateLayout.selectionTableRef.value?.selectedRecords
})

watch (selectedSourcePlate, async (newValue) => {
    if (newValue?.id) {
        sourcePlateLayout.setPlateId(newValue.id)
        await sourcePlateLayout.loadPlate({
            oligo: true,
        })
        sourcePlateWithWellSpecs.value = {
            ...sourcePlateLayout.plateWithWellContents.value,
            wells: _.values(sourcePlateLayout.wellSpecs.value),
        }
    } else {
        sourcePlateWithWellSpecs.value = null
    }
})

onMounted(async() => {
    sgRnaCloningExperiment.value = await RecordService.getRecord(
        `${config.public.apiBase}/sg-rna-cloning-experiments`,
        route.params.id as string,
        {
            plates: true
        },
    )

    const plateId = _.get(sgRnaCloningExperiment.value, 'plates[0].id')

    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: ['oligo.targetId'],
        selectionTableRecordIdPaths: ['oligoId'],
        tooltip: (well: any) => {
            const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
            const oligos = _.map(well.wellContents, 'oligo')
            return oligos ? `${wellCoordinate}:<br>` + _.map(oligos, 'name').join('<br>') : wellCoordinate
        },
        symbol: (well: any) => {
            const oligos = _.compact(_.map(well.wellContents, 'oligo'))
            return oligos ? _.size(oligos) : ''
        },
    }
    sourcePlateLayout.wellContentsDisplayConfig.value = _.clone(plateLayout.wellContentsDisplayConfig.value)

    if (plateId) {
        plateLayout.setPlateId(plateId)
        loadPlate()
    }
})

const loadPlate = async () => {
    await plateLayout.loadPlate(
        {
            oligo: true,
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
                    ..._.pick(wellContent, ['oligoId']),
                    wellId: destinationWell.id,
                    sourceWellIds: [well.id],
                    createdBy: (user.value as User)?.id,
                }
            })
        }))
        await plateLayout.addWellContents(wellContentsToAdd.flat())
    }
}

const columnDefs = {
    plateType: { display: false },
    snvLibCloningExperimentId: { display: false },
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
    wellsProcessedCount: { display: false },
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

// for source plates table, only select guide RNA plates that are not associated with an experiment
const whereClause ={
    "and": [
        {"in": [{"var": "plateType"}, ["guide-rna"]]},
        {"==": [{"var": "sgRnaCloningExperimentId"}, null]},
    ]
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
                :sortBy="['name']"
                selectionMode="single"
                :showColumnFilters="true"
                emptyMessage="">
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
