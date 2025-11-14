<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, wellCoordinateToChar } from '~/lib/plate-diagram'

const { breakpoints } = useLayout()
const route = useRoute()
const plateLayout = usePlateLayout()
const toast = useToast()

const smallerThanLg = breakpoints.smaller('lg')
const plateWithWellSpecs = ref()
const plateDiagramKey = ref(0)

onMounted(async() => {
    plateLayout.setPlateId(route.params.id as string)
    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: ['sgRnaPlasmid.id'],
        selectionTableRecordIdPaths: ['sgRnaPlasmid.id'],
        tooltip: (well: any) => {
            const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
            const plasmid = _.get(well, 'wellContents.0.wellable.sgRnaPlasmid')
            return plasmid ? `${wellCoordinate}: ${plasmid.name}` : wellCoordinate
        },
    }
    loadPlate()
})

const loadPlate = async () => {
    await plateLayout.loadPlate(
        {
            sgRnaPlasmid: true,
        },
    )

    plateWithWellSpecs.value = {
        ...plateLayout.plateWithWellContents.value,
        wells: _.values(plateLayout.wellSpecs.value),
    }
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
            name: true,
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
    target: {
        header: 'Target',
        format: (x: any) => {
            return x.target ? x.target.name : ''
        },
        path: 'target.displayValue',
        index: 2,
    },
    targetId: { display: false },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            const wellContents = _.find(x?.wellable?.wellContents || [], (content) => content.well.plate.id == route.params.id)
            return wellContents ? ` ${_.get(wellContents, 'well.plate.name')}: ${wellCoordinateToChar(wellContents.well?.y)}${wellContents.well?.x}` : ''
        },
        path: 'wellContents.displayValue',
        type: 'string',
        index: 3,
    },
}
const rowActions = {
    assign: {
        label: '',
        action: async (data: any) => {
            if (plateLayout.selectedWells.value.length === 0) {
                toast.add({ severity: 'warn', summary: 'No wells selected', detail: 'Please select wells to assign primers to.', life: 3000 })
                return
            } else if (plateLayout.selectedWells.value.length > 1) {
                toast.add({ severity: 'warn', summary: 'Multiple wells selected', detail: 'Please select only one well to assign a primer.', life: 3000 })
                return
            } else if (!_.isEmpty(plateLayout.selectedWells.value[0].data.wellContents)) {
                toast.add({ severity: 'warn', summary: 'Well already has contents', detail: 'Please select an empty well to assign a primer.', life: 3000 })
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
                tableName="sg-rna-plasmids"
                schemaName="select"
                :canAdd="false"
                :canEdit="false"
                :canExport="true"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
                :showColumnFilters="true"
                :rowActions="rowActions"
                emptyMessage=""
                v-model:frozenRecordIds="frozenRecordIds"
            />
        </SplitterPanel>
        <SplitterPanel class="flex justify-center overflow-scroll mt-10" :size="40" :minSize="25">
            <PlateDiagram
                :key="plateDiagramKey"
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
</template>
