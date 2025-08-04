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
const splitter = ref()
const selectionTableKey = ref(0)
const experimentPlateDiagramKey = ref(0)
const sgRnaCloningExperiment = ref()
const sgRnaPlasmidsEditingRecordIds = ref<string[]>([])
const crudTable = useCrudTable()

const showSgRnaPlasmidEditDialog = computed(() => {
    return crudTable.state.showEditForm || crudTable.state.showMultipleEditForm
})
const selectedSourcePlate = computed(() => {
    return plateLayout.selectionTableRef.value?.selectedRecords
})

const plamidPlateDisplayConfig = {
    colorBy: ['sgRnaPlasmid.targetId'],
    selectionTableRecordIdPaths: ['sgRnaPlasmidId'],
    tooltip: (well: any) => {
        const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
        const sgRnaPlasmid = _.get(well.wellContents, [0, 'sgRnaPlasmid'])
        return sgRnaPlasmid ? `${wellCoordinate}:<br>` + _.get(sgRnaPlasmid, 'name') : wellCoordinate
    },
    symbol: (well: any) => {
        const sgRnaPlasmid = _.get(well.wellContents, [0, 'sgRnaPlasmid'])
        if (sgRnaPlasmid?.verificationStatus == 'passed') {
            return '✓'
        } else if (sgRnaPlasmid?.verificationStatus == 'failed') {
            return 'x'
        } else {
            return ''
        }
    },
}
const oligoPlateDisplayConfig = {
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

const sgRnaOligoExportColumns = [
    {
        header: 'Well Position',
        data: (well: any) => `${wellCoordinateToChar(well.y)}${well.x}`,
    },
    {
        header: 'Oligo 1',
        data: (well: any) => _.get(well, 'wellContents.0.oligo.name')
    },
    {
        header: 'Oligo 2',
        data: (well: any) => _.get(well, 'wellContents.1.oligo.name')
    },
]
const sgRnaPlasmidExportColumns = [
    {
        header: 'Well Position',
        data: (well: any) => `${wellCoordinateToChar(well.y)}${well.x}`,
    },
    {
        header: 'sgRNA Plasmid',
        data: (well: any) => _.get(well, 'wellContents.0.sgRnaPlasmid.name')
    },
]

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

    plateLayout.wellContentsDisplayConfig.value = sgRnaCloningExperiment.value?.transformed ? plamidPlateDisplayConfig : oligoPlateDisplayConfig

    plateLayout.setExportPlateLayoutConfig({
        columns: sgRnaCloningExperiment.value?.transformed ? sgRnaPlasmidExportColumns : sgRnaOligoExportColumns,
    })

    sourcePlateLayout.wellContentsDisplayConfig.value = oligoPlateDisplayConfig
    sourcePlateLayout.setExportPlateLayoutConfig({
        columns: sgRnaOligoExportColumns,
    })

    if (plateId) {
        plateLayout.setPlateId(plateId)
        loadPlate()
    }

    // resets splitter panel sizes after content has been rendered
    nextTick(() => {
        splitter.value.resetState()
    })

})

const loadPlate = async () => {
    await plateLayout.loadPlate(
        {
            oligo: true,
            sgRnaPlasmid: true,
        },
    )

    plateWithWellSpecs.value = {
        ...plateLayout.plateWithWellContents.value,
        wells: _.values(plateLayout.wellSpecs.value),
    }
}

const transformOligos = async () => {
    const plate = plateLayout.plateWithWellContents.value
    if (!plate || !Array.isArray(plate.wells)) {
        toast.add({severity: 'warn', summary: 'Plate data is not loaded', life: 3000})
        return
    }
    try {
        const result = await $fetch(`${config.public.apiBase}/custom/plates/${plate.id}/transform-sg-rna-oligos`, {
            method: 'POST',
            body: {},
        })
        // refresh the plate if transformation was successful
        plateLayout.wellContentsDisplayConfig.value = plamidPlateDisplayConfig

        plateLayout.setExportPlateLayoutConfig({
            columns: sgRnaPlasmidExportColumns,
        })
        await loadPlate()
        experimentPlateDiagramKey.value += 1 // force re-render of the plate diagram
    } catch (error: any) {
        toast.add({severity: 'error', summary: 'Transformation failed', detail: error.statusMessage, life: 3000})
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

const plateTableColumnDefs = {
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
const sgRnaPlasmidTableFrozenRecordIds = computed(() => {
    return _.compact(_.flatten(_.map(plateLayout.selectedWells.value, 'selectionTableRecordIds')))
})
const sgRnaPlasmidDisplayWithClause = {
    target: {
        columns: {
            id: true,
            name: true,
        },
    },
    wellContents: {
        columns: {
            id: true,
        },
        with: {
            well: {
                columns: {
                    id: true,
                    x: true,
                    y: true,
                    plateId: true,
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
const sgRnaPlasmidTableColumnDefs = {
    targetId: { display: false },
    target: {
        format: (data: any) => {
            return data.target?.name || '-'
        },
        path: 'target.displayValue',
    },
    wellContents: { display: false },
    wellCoordinates: {
        format: (data: any) => {
            return data.wellContents?.map((wellContent: any) => {
                return `${wellContent.well?.plate?.name}: ${wellCoordinateToChar(wellContent.well?.y)}${wellContent.well?.x}`
            }).join(', ') || '-'
        },
        path: 'wellCoordinates.displayValue',
    },
}
const didClickRecordEdit = (recordId: string) => {
    sgRnaPlasmidsEditingRecordIds.value = [recordId]
}
const didClickMultipleRecordEdit = (recordIds: string[]) => {
    sgRnaPlasmidsEditingRecordIds.value = recordIds
}
const setCrudAndPlateLayoutTableRefs = (el: any) => {
    plateLayout.setSelectionTableRef(el)
    crudTable.setTableRef(el)
}
const sgRnaPlasmidFieldDefs = {
    targetId: {
        label: 'Target',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/targets`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        readOnly: true,
    },
}
const didUpdateRecord = async (record: any) => {
    crudTable.didUpdateRecord(record)
    await loadPlate()
    experimentPlateDiagramKey.value += 1 // force re-render of the plate diagram
}
const didUpdateMultipleRecords = async (record: any) => {
    crudTable.didUpdateMultipleRecords(record)
    await loadPlate()
    experimentPlateDiagramKey.value += 1 // force re-render of the plate diagram
}
</script>
<template>
    <Splitter ref="splitter" class="h-full mb-8" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
        <SplitterPanel v-if="sgRnaCloningExperiment?.transformed != true" class="overflow-scroll" :size="60">
            <div class="text-2xl font-bold mt-4 ml-4">sgRNA Cloning: {{ sgRnaCloningExperiment?.name }}</div>
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
                :columnDefs="plateTableColumnDefs"
                :sortBy="['name']"
                selectionMode="single"
                :showColumnFilters="true"
                emptyMessage="">
            </QuickTable>
        </SplitterPanel>
        <SplitterPanel :size="40" :minSize="25">
            <Splitter layout="vertical">
                <SplitterPanel v-if="sgRnaCloningExperiment?.transformed != true" class="flex justify-center overflow-scroll mt-10">
                    <PlateDiagram
                        :ref="sourcePlateLayout?.setPlateDiagramRef"
                        v-if="selectedSourcePlate?.id && sourcePlateWithWellSpecs"
                        v-model="sourcePlateWithWellSpecs"
                        :plateType="sourcePlateWithWellSpecs.plateType"
                        :sizeX="sourcePlateWithWellSpecs.sizeX"
                        :sizeY="sourcePlateWithWellSpecs.sizeY"
                        :showExportButton="true"
                        @well-range-selected="sourcePlateLayout?.wellRangeSelected"
                        @well-selection-cleared="sourcePlateLayout?.wellSelectionCleared"
                        @all-wells-selected="sourcePlateLayout?.selectedAllWells"
                        @well-contents-updated="sourcePlateLayout?.updatedWellContents"
                        @did-click-export-plate-layout="sourcePlateLayout?.exportPlateLayout" >
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
                    <div class="flex flex-col">
                        <PlateDiagram
                            :key="experimentPlateDiagramKey"
                            :ref="plateLayout.setPlateDiagramRef"
                            v-if="plateWithWellSpecs"
                            v-model="plateWithWellSpecs"
                            :plateType="plateWithWellSpecs.plateType"
                            :sizeX="plateWithWellSpecs.sizeX"
                            :sizeY="plateWithWellSpecs.sizeY"
                            :showExportButton="true"
                            @well-range-selected="plateLayout.wellRangeSelected"
                            @well-selection-cleared="plateLayout.wellSelectionCleared"
                            @all-wells-selected="plateLayout.selectedAllWells"
                            @well-contents-updated="plateLayout.updatedWellContents"
                            @did-click-export-plate-layout="plateLayout.exportPlateLayout" >
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
                        <Button
                            class="w-fit ml-auto mr-auto mt-4 p-4"
                            v-if="sgRnaCloningExperiment?.transformed != true"
                            icon="pi pi-play"
                            iconPos="right"
                            severity="primary"
                            label="Transform"
                            @click="transformOligos">
                        </Button>
                        <br/>
                    </div>
                </SplitterPanel>
            </Splitter>
        </SplitterPanel>
        <SplitterPanel v-if="sgRnaCloningExperiment?.transformed && sgRnaCloningExperiment?.plates?.[0]?.id" class="overflow-scroll" :size="60" :minSize="25">
            <div class="text-2xl font-bold mt-4 ml-4">sgRNA Cloning: {{ sgRnaCloningExperiment?.name }}</div>
            <QuickTable
                :key="selectionTableKey"
                :ref="setCrudAndPlateLayoutTableRefs"
                tableName="sg-rna-plasmids"
                schemaName="select"
                :canAdd="false"
                :canDelete="false"
                :canExport="false"
                :canEditMultiple="true"
                :columnDefs="sgRnaPlasmidTableColumnDefs"
                :sortBy="['name']"
                :withClause="sgRnaPlasmidDisplayWithClause"
                :where="{'==': [{'var': 'wellContents.0.well.plateId'}, sgRnaCloningExperiment?.plates?.[0]?.id]}"
                :showColumnFilters="true"
                emptyMessage=""
                v-model:frozenRecordIds="sgRnaPlasmidTableFrozenRecordIds"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit" />
        </SplitterPanel>
    </Splitter>
    <Dialog v-model:visible="showSgRnaPlasmidEditDialog" modal header="Edit" :style="{ width: 'auto' }" :closable="false">
        <QuickForm
            v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
            :recordId="crudTable.state.editingRecordId"
            tableName="sg-rna-plasmids"
            schemaName="update"
            :canDelete="false"
            :fieldDefs="sgRnaPlasmidFieldDefs"
            @cancel="crudTable.didClickCancelEditForm"
            @recordUpdate="didUpdateRecord"
        />
        <QuickFormMultiple
            v-if="crudTable.state.showMultipleEditForm"
            tableName="sg-rna-plasmids"
            :recordIds="crudTable.state.editingMultipleRecordsIds"
            schemaName="update"
            :fieldDefs="sgRnaPlasmidFieldDefs"
            @cancel="crudTable.didClickCancelMultipleEditForm"
            @records-update="didUpdateMultipleRecords"
        />
    </Dialog>
</template>
