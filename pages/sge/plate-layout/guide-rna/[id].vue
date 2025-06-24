<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, wellCoordinateToChar } from '~/lib/plate-diagram'

const { breakpoints } = useLayout()
const route = useRoute()
const plateLayout = usePlateLayout(route.params.id as string)

const smallerThanLg = breakpoints.smaller('lg')
const plateWithWellSpecs = ref()

onMounted(async() => {
    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: [() => true],
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
    loadPlate()
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

const importSgRnaOligos = async () => {
    try {

    } catch (error) {
        console.error('Error importing sgRNA oligos:', error)
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
    sequence: { display: false },
    kit: {display: false},
    name: {
        index: 1,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            const wellContents = _.find(x.wellContents, (x) => x.well.plate.id == route.params.id)
            return wellContents ? ` ${_.get(wellContents, 'well.plate.name')}: ${wellCoordinateToChar(wellContents.well?.y)}${wellContents.well?.x}` : ''
        },
        path: 'wellContents.displayValue',
        type: 'string',
        index: 2,
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
                tableName="oligos"
                schemaName="select"
                :canAdd="false"
                :canDelete="false"
                :canEdit="false"
                :canExport="true"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
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
                    <FileUpload
                        mode="basic"
                        accept="application/msexcel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                        class="p-button-icon-only p-button-info"
                        :maxFileSize="1000000"
                        @upload="importSgRnaOligos"
                        :auto="true"
                        chooseLabel=""
                        v-tooltip="{value: 'Upload sgRNA oligos', showDelay: 500}"
                    >
                        <template #chooseicon>
                            <i class="pi pi-upload"></i>
                        </template>
                    </FileUpload>
                    <!-- <Button
                        class="p-button-secondary"
                        icon="pi pi-upload"
                        @click="importSgRnaOligos" /> -->
                </template>
            </PlateDiagram>
        </SplitterPanel>
    </Splitter>
</template>
