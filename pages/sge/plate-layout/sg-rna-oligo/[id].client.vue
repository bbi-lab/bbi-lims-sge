<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, wellCoordinateToChar } from '~/lib/plate-diagram'

const { breakpoints } = useLayout()
const route = useRoute()
const plateLayout = usePlateLayout()
const config = useRuntimeConfig()
const { showLoginModal } = useLayout()
const toast = useToast()

const smallerThanLg = breakpoints.smaller('lg')
const plateWithWellSpecs = ref()
const plateDiagramKey = ref(0)

onMounted(async() => {
    plateLayout.setPlateId(route.params.id as string)
    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: ['sgRnaOligo.id'],
        selectionTableRecordIdPaths: ['sgRnaOligo.id'],
        tooltip: (well: any) => {
            const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
            const oligos = _.map(well.wellContents, 'wellable.sgRnaOligo')
            return oligos ? `${wellCoordinate}:<br>` + _.map(oligos, 'name').join('<br>') : wellCoordinate
        },
        symbol: (well: any) => {
            const oligos = _.compact(_.map(well.wellContents, 'sgRnaOligo'))
            return oligos ? _.size(oligos) : ''
        },
    }
    loadPlate()
})

const loadPlate = async () => {
    await plateLayout.loadPlate(
        {
            sgRnaOligo: true,
        },
    )

    plateWithWellSpecs.value = {
        ...plateLayout.plateWithWellContents.value,
        wells: _.values(plateLayout.wellSpecs.value),
    }
}

const importSgRnaOligos = (e: any) => {
    try {
        const files = e.files
        const f = files[0]

        fileToSheet(f, submitSgRnaOligos)
    } catch (error) {
        console.error('Error importing sgRNA oligos:', error)
    }
}

const submitSgRnaOligos = async (data: any[]) => {
    try {
        const result = await $fetch(`${config.public.apiBase}/custom/plates/${route.params.id}/import-sg-rna-oligos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data,
        })
        if (!_.isEmpty(result)) {
            toast.add({
                severity: 'success',
                summary: 'sgRNA oligos imported',
                life: 3000,
            })
            plateLayout.selectionTableRef.value.addOrRefreshRecordIds(_.map(result as any[], 'id'))
            await loadPlate()
            // force a re-render of the plate diagram
            plateDiagramKey.value += 1
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error importing sgRNA oligos',
                life: 3000,
            })
        }
    } catch (error: any) {
        if (error.data?.statusCode == 401 && error.data?.statusMessage == 'TOKEN EXPIRED') {
            showLoginModal()
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: error.data?.statusMessage, life: 5000 })
        }
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
    sgRnaOligoTargets: {
        with: {
            target: {
                columns: {
                    name: true,
                },
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
    sgRnaOligoTargets: {
        header: 'Target(s)',
        format: (x: any) => {
            return _.map(x.sgRnaOligoTargets, (sgRnaOligoTarget: any) => {
                return sgRnaOligoTarget.target.name
            })
        },
        path: 'sgRnaOligoTargets.displayValue',
        index: 2,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            const wellContents = _.filter(x?.wellable?.wellContents || [], (content) => content.well.plate.id == route.params.id)
            return (!_.isEmpty(wellContents) ?
                _.map(wellContents, (content) => ` ${_.get(content, 'well.plate.name')}: ${wellCoordinateToChar(content.well?.y)}${content.well?.x}`) :
                []).join(', ')
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
                tableName="sg-rna-oligos"
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
                    <FileUpload
                        mode="basic"
                        accept="application/msexcel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                        class="p-button-icon-only p-button-info"
                        :maxFileSize="1000000"
                        :customUpload="true"
                        :auto="true"
                        @uploader="importSgRnaOligos"
                        chooseLabel=""
                        v-tooltip="{value: 'Upload sgRNA oligos', showDelay: 500}"
                    >
                        <template #chooseicon>
                            <i class="pi pi-upload"></i>
                        </template>
                        <template #uploadicon>
                            <i class="pi pi-upload"></i>
                        </template>
                    </FileUpload>
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
