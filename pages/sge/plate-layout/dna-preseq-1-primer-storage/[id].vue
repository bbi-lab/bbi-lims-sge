<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, wellCoordinateToChar } from '~/lib/plate-diagram'

const { breakpoints } = useLayout()
const route = useRoute()
const plateLayout = usePlateLayout()
const toast = useToast()

const smallerThanLg = breakpoints.smaller('lg')
const plateWithWellSpecs = ref()

onMounted(async() => {
    plateLayout.setPlateId(route.params.id as string)
    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: ['preseq1Primer.preseq1PrimerTargets'],
        selectionTableRecordIdPaths: ['preseq1Primer.id'],
        tooltip: (well: any) => {
            const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
            const primerName = _.get(well, ['wellContents', 0, 'wellable', 'preseq1Primer', 'name'])
            return primerName ? `${wellCoordinate}:<br>${primerName} (PCR1)` : wellCoordinate
        },
        symbol: (well: any) => {
            const primerDirection = _.get(well, ['wellContents', 0, 'wellable', 'preseq1Primer', 'sequenceType'])
            return primerDirection ? _.upperCase(primerDirection[0]) : ''
        },
    }

    plateLayout.setExportPlateLayoutConfig({
        columns: [
            { header: 'Well Position', data: (well: any) => {
                return `${wellCoordinateToChar(well.y)}${well.x}`
            }},
            { header: 'Primer', data: (well: any) => {
                return _.get(well, ['wellContents', 0, 'wellable', 'preseq1Primer', 'name']) || ''
            }},
            { header: 'Project', data: (well: any) => {
                return _.uniq(_.map(_.get(well, ['wellContents', 0, 'wellable', 'preseq1Primer', 'preseq1PrimerTargets']) || [], 'target.project.name')).join(', ')
            }},
            { header: 'Target', data: (well: any) => _.map(_.get(well, ['wellContents', 0, 'wellable', 'preseq1Primer', 'preseq1PrimerTargets']) || [], 'target.name').join(', ') },
        ],
        sortBy: (well: any) => {
            return `${wellCoordinateToChar(well.y)}${well.x}`
        }
    })
    loadPlate()
})

const loadPlate = async () => {
    await plateLayout.loadPlate(
        {
            preseq1Primer: {
                with: {
                    preseq1PrimerTargets: {
                        with: {
                            target: {
                                with: {
                                    project: {
                                        columns: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    }
                }
            },
        },
    )

    plateWithWellSpecs.value = {
        ...plateLayout.plateWithWellContents.value,
        wells: _.values(plateLayout.wellSpecs.value),
    }
}

const whereClause = {
    'or':[
        {'==':[{'var': 'wellContents'}, null]},
        {'==':[{'var': 'wellContents.well.plate.id'}, route.params.id]},
    ]
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
    preseq1PrimerTargets: {
        with: {
            target: {
                columns: {
                    name: true
                },
                with: {
                    project: {
                        columns: {
                            name: true
                        }
                    },
                    region: {
                        columns: {
                            name: true
                        },
                        with: {
                            gene: {
                                columns: {
                                    symbol: true
                                }
                            }
                        }
                    },
                },
            },
        }
    }
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
    name: {
        index: 1
    },
    preseq1PrimerTargets: {
        header: 'Target(s)',
        format: (x: any) => {
            return _.map(x.preseq1PrimerTargets, 'target.name')
        },
        path: 'preseq1PrimerTargets.displayValue',
        index: 2,
        exportValue: (x: any) => {
            return _.map(x.preseq1PrimerTargets, 'target.name').join(', ')
        },
    },
    projects: {
        header: 'Project(s)',
        format: (x: any) => {
            return _.uniq(_.map(x.preseq1PrimerTargets, 'target.project.name')).join(', ')
        },
        path: 'projects.displayValue',
        index: 3,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            // return _.has(x, 'wellContents.well.plate') ? ` ${_.get(x, 'wellContents.well.plate.name')}: ${wellCoordinateToChar(x.wellContents?.well?.y)}${x.wellContents?.well?.x}` : ''
            if (!_.isEmpty(x?.wellable?.wellContents)) {
                return _.map(x.wellable.wellContents, (wellContent) => {
                    return `${_.get(wellContent, 'well.plate.name')}: ${wellCoordinateToChar(wellContent?.well?.y)}${wellContent?.well?.x}`
                }).join(', ')
            } else {
                return ''
            }
        },
        path: 'wellContents.displayValue',
        type: 'string',
        index: 4,
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
                tableName="preseq-1-primers"
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
        </SplitterPanel>
    </Splitter>
</template>
