<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, wellCoordinateToChar, type PlateDiagramWell } from '@/composables/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import type { PlateWithPlateDiagramWells } from '~/components/PlateDiagram.vue'
import type { WellContent } from '~/server/db/schema/sge/well'
import { type PlateWithWellContents, type WellSpecs, assignNucleicAcidsToPreseq1Plate, assignToPlate, updateWellSpecs } from '~/utils/sge/plateUtils'
import { PLATE_TYPE_SPECS } from '~/utils/sge/plateUtils'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import type { PlateType } from '~/server/db/schema/sge/plate'

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()
const breakpoints = useBreakpoints(breakpointsTailwind)
const smallerThanLg = breakpoints.smaller('lg')
const { showLoginModal } = useLayout()
const { user } = useUserSession()

const plateWithWellContents = ref<PlateWithWellContents>()
const contentSelectionTable = ref()
const plateWithPlateDiagramWells = ref<PlateWithPlateDiagramWells>()
const plateDiagram = ref()
const selectedWells = ref<PlateDiagramWell[]>()
const wellSpecs = ref<WellSpecs>({})
const pcrExperiment = ref()

const plateType = route.params.plateType as PlateType
// TODO handle multiple wellContentsRelations (for PreSeq-3)
const wellContentsRelationName = _.get(PLATE_TYPE_SPECS, [plateType, 'wellContentsRelations', 0, 'name'])
const tableName = _.get(PLATE_TYPE_SPECS, [ plateType, 'selectionTableName'])
const tableWhereClause = ref()


const colorMapBySelectionTableId = computed(() => {
    const colorMap = {}
    _.forEach(_.values(wellSpecs.value), (wellSpec) => {
        _.forEach(wellSpec.contentFKs, (wellContentFK) => {
            _.set(colorMap, wellContentFK, wellSpec.color)
        })
    })
    return colorMap
})

const frozenRecordIds = computed(() => {
    return _.compact(_.flatten(_.map(selectedWells.value, (well) => {
        return _.map(well.data.wellContents, (contents) => { return _.get(contents, [wellContentsRelationName, 'id']) })
    })))
})

onMounted(async() => {
    refreshPlate()
})

const refreshPlate = async () => {
    plateWithWellContents.value = await RecordService.getRecord(
        `${config.public.apiBase}/plates`,
        route.params.id as string,
        {
            wells: {
                columns: {
                    id: true,
                    x: true,
                    y: true
                },
                with: {
                    wellContents: {
                        with: {
                            amplificationPrimer: route.params.plateType == 'amp-storage',
                            linearizationPrimer: route.params.plateType == 'lin-storage',
                            homologyArmPrimer: route.params.plateType == 'ha-storage',
                            nucleicAcid: _.includes(['preseq-1', 'preseq-2', 'preseq-3'], route.params.plateType) ? {with: {pellet: true}} : false,
                            indexPrimer: _.includes(['seq-index', 'preseq-3'], route.params.plateType),
                            wellContentSources: {
                                with: {
                                    sourceWell: {
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
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        }
                    },
                }
            },
        }
    )

    if (_.isEmpty(plateWithWellContents.value)) return

    if (_.get(plateWithWellContents.value, 'pcrExperimentId')) {
        pcrExperiment.value = await RecordService.getRecord(
            `${config.public.apiBase}/pcr-experiments`,
            plateWithWellContents.value.pcrExperimentId as string,
            {
                transfectTarget: {
                    columns: {id: true},
                }
            }
        )
    }

    if (plateType == 'preseq-3') {
        tableWhereClause.value = {
            "in": [{"var": "plateType"}, ["preseq-2", "seq-index"]]
        }
        if (pcrExperiment.value?.cycleId) {
            tableWhereClause.value = {
                "and": [
                    tableWhereClause.value,
                    {"==": [{"var": "cycleId"}, pcrExperiment.value.cycleId]}
                ]
            }
        }
    } else if (plateType == 'preseq-2') {
        tableWhereClause.value = {
            "==": [{"var": "plateType"}, "preseq-1"]
        }
        if (pcrExperiment.value?.cycleId) {
            tableWhereClause.value = {
                "and": [
                    tableWhereClause.value,
                    {"==": [{"var": "cycleId"}, pcrExperiment.value.cycleId]}
                ]
            }
        }
    } else if (plateType == 'preseq-1' && pcrExperiment.value?.transfectTarget) {
        tableWhereClause.value = {'==':[{'var': 'pellet.transfectTarget.id'}, pcrExperiment.value.transfectTarget.id]}
    } else if (plateType == 'seq-index') {
        tableWhereClause.value = {}
    } else {
        tableWhereClause.value = {
            'or':[
                {'==':[{'var': 'wellContents'}, null]},
                {'==':[{'var': 'wellContents.well.plate.id'}, route.params.id]},
            ]
        }
    }

    updateWellSpecs(wellSpecs.value, plateWithWellContents.value)

    // replace wells from data model with plateDiagramWells to include visualization properties
    plateWithPlateDiagramWells.value = {
        ...plateWithWellContents.value,
        wells: _.values(wellSpecs.value),
    }

    // refresh selectedWells
    selectedWells.value = _.filter(plateWithPlateDiagramWells.value?.wells, (x) => {
        return _.includes(_.map(selectedWells.value, 'id'), x.id)
    })
}

const sharedWithClause = {
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
const displayWithClause = Object.freeze({
    'amplification-primers': {
        ...sharedWithClause,
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
    },
    'homology-arm-primers': {
        ...sharedWithClause,
    },
    'linearization-primers': {
        ...sharedWithClause,
    },
    'index-primers': {
        ...sharedWithClause,
    },
    'nucleic-acids': {
        ...sharedWithClause,
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
})

const sharedColumnDefs = {
    colorTile:{
        index: 0,
        header: '',
        sortable: false,
        type: 'element',
        element: (x: any) => {
            const tileColor = _.get(colorMapBySelectionTableId.value, x.id)
            return tileColor ? `<span
                class="inline-block w-6 h-6 rounded-sm text-center"
                style="color: ${getWellTextColor(tileColor)}; background-color:${tileColor}">
                ${x.sequenceType ? _.upperCase(x.sequenceType[0]) : ''}
            </span>` : ''
        },
        searchable: false,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => { return _.has(x, 'wellContents.well.plate') ? ` ${_.get(x, 'wellContents.well.plate.name')}: ${wellCoordinateToChar(x.wellContents?.well?.y)}${x.wellContents?.well?.x}` : ''},
        path: 'wellContents.displayValue',
        type: 'string',
        index: 2,
    },
}
const columnDefs = {
    'amplification-primers': {
        ...sharedColumnDefs,
        name: {
            index: 1
        },
        targetId: {
            header: 'Target',
            format: (x: any) => {
                return x.target?.name || (x.target?.region ? `${_.get(x, 'target.region.gene.symbol')} : ${_.get(x, 'target.region.name')}` : '')
            },
            path: 'targetId.displayValue',
            type: 'string',
            index: 2,
        },
        project: {
            format: (x: any) => {
                return x.target?.project?.name || ''
            },
            path: 'project.displayValue',
            index: 3,
        },
    },
    'linearization-primers': {
        ...sharedColumnDefs
    },
    'homology-arm-primers': {
        ...sharedColumnDefs
    },
    'index-primers': {
        ...sharedColumnDefs,
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
    },
    'nucleic-acids': {
        ...sharedColumnDefs,
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
    },
    'view-plates-with-well-counts': {
        plateType: { display: false },
        plateTypeLabel: { header: 'Type' },
        cycleName: { header: 'Cycle' },
        cycleId: { display: false },
        pcrExperimentId: { display: false},
        sizeX: { display: false },
        sizeY: { display: false },
        wellsCount: { display: false },
        wellsWithContentCount: { display: false },
        wellsProcessedCount: { header: 'Wells processed' },
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
}

const wellRangeSelected = function(wells: PlateDiagramWell[]) {
    selectedWells.value = _.filter(plateWithPlateDiagramWells.value?.wells, (x) => {
        return _.includes(_.map(wells, 'id'), x.id)
    })
    toast.add({
        severity: 'info',
        summary: 'Well Range Selected',
        detail: `You selected ${wells.length} ${wells.length==1 ? 'well' : 'wells'}`,
        life: 1000,
    })
}

const selectedAllWells = function(wells: PlateDiagramWell[]) {
    selectedWells.value = wells
    toast.add({
        severity: 'info',
        summary: 'All Wells Selected',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
}
const wellSelectionCleared = function(wells: PlateDiagramWell[]) {
    selectedWells.value = []
    wells.forEach((well) => {
        well.data = null
    })
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 1000,
    })
}
const layoutPreseq1 = async () => {
    if (plateWithWellContents.value) {
        let wellContentsAdded
        try {
            wellContentsAdded = await assignNucleicAcidsToPreseq1Plate(contentSelectionTable.value.selectedRecords, plateWithWellContents.value, config.public.apiBase)
        } catch (error: any) {
            if (error.statusCode == 401 && error.statusMessage == 'TOKEN EXPIRED') {
                showLoginModal()
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
            }
            return
        }

        if (!_.isEmpty(wellContentsAdded)) {
            const updatedWellIds = _.map(wellContentsAdded, 'wellId')
            const oldValues = _.values(_.pick(wellSpecs.value, updatedWellIds))

            await refreshPlate()
            const updatedWells = _.values(_.pick(wellSpecs.value, updatedWellIds))
            if (!_.isEmpty(updatedWells)) {
                plateDiagram.value.updateWells(
                    updatedWells,
                    oldValues
                )
            }
        }
    }
}

const actionOnSelectedWells = function() {
    toast.add({
        severity: 'info',
        summary: 'Well action',
        detail: `You performed an action on ${selectedWells.value?.length || 0} wells`,
        life: 1000,
    })
}
const updatedWellContents = async function(newValues: PlateDiagramWell[], oldValues: PlateDiagramWell[]) {
    await refreshPlate()

    const contentSelectionTableIdsToRefresh = _.compact([
        ..._.flatten(_.map(newValues || [], (well) => { return _.compact(_.map(well.data?.wellContents, (contents) => { return _.get(contents, [wellContentsRelationName, 'id']) })) })),
        ..._.flatten(_.map(oldValues || [], (well) => { return _.compact(_.map(well.data?.wellContents, (contents) => { return _.get(contents, [wellContentsRelationName, 'id']) })) })),
    ])
    contentSelectionTableIdsToRefresh.forEach((id) => {
        contentSelectionTable.value.addOrRefreshRecordId(id)
    })
    // forces frozen records to be re-evaluated when the well contents are being cleared
    selectedWells.value = _.filter(plateWithPlateDiagramWells.value?.wells, (x) => {
        return _.includes(_.map(newValues, 'id'), x.id)
    })
}
const emptySelectedWells = async () => {
    const oldValues = _.values(_.pick(wellSpecs.value, _.map(selectedWells.value, 'id')))
    const wellContentsToDelete = _.flatten(_.compact(_.map(selectedWells.value, (x) => {
        return _.get(x, 'data.wellContents')
    })))
    let deletedRecords: WellContent[]
    try {
        deletedRecords = await RecordService.deleteRecords(
            `${config.public.apiBase}/well-contents`,
            wellContentsToDelete
        )
    } catch (error: any) {
        if (error.statusCode == 401 && error.statusMessage == 'TOKEN EXPIRED') {
            showLoginModal()
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
        }
        return
    }
    if (!_.isEmpty(deletedRecords)) {
        await refreshPlate()
        const deletedWellIds = _.uniq(_.map(deletedRecords, (deletedRecord) => deletedRecord.wellId))
        const updatedWells = _.values(_.pick(wellSpecs.value, deletedWellIds))
        plateDiagram.value.updateWells(updatedWells, oldValues)

        if (tableName == 'view-plates-with-well-counts') {
            const plateIds = _.uniq(_.flattenDeep(_.map(oldValues, (x) => _.map(x.data.wellContents, (wellContent) => _.uniq(_.map(wellContent.wellContentSources, 'sourceWell.plate.id'))))))
            for (const plateId of plateIds) {
                contentSelectionTable.value.addOrRefreshRecordId(plateId)
            }
        }
        toast.add({
            severity: 'info',
            summary: 'Updated well',
            detail: `Emptied ${_.size(updatedWells)} wells`,
            life: 1000,
        })
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error emptying wells',
            life: 1000,
        })
    }
}
const rowActions = {
    assign: {
        label: '',
        action: async (data: any) => {
            if (_.size(selectedWells.value) != 1 && !_.includes(['preseq-1', 'preseq-2', 'preseq-3'], plateType)) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Select a single well to add contents',
                    life: 1000,
                })
            } else {
                const selectedWellIds = _.map(selectedWells.value || [], 'id')
                const oldValues = !_.isEmpty(selectedWellIds) ? _.values(_.pick(wellSpecs.value, selectedWellIds)) : {}

                let newRecords
                try {
                    newRecords = await assignToPlate(plateType, selectedWells.value, data, config.public.apiBase, user.value)
                } catch (e: any) {
                    if (e.statusCode == 401 && e.statusMessage == 'TOKEN EXPIRED') {
                        showLoginModal()
                    } else {
                        toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: e.message || 'Error calculating plate layout',
                            life: 3000,
                        })
                    }
                    return
                }
                if (!_.isEmpty(newRecords)) {
                    await refreshPlate()
                    const updatedWells = _.values(_.pick(wellSpecs.value, selectedWellIds))
                    if (!_.isEmpty(updatedWells)) {
                        plateDiagram.value.updateWells(
                            updatedWells,
                            oldValues
                        )
                    }
                    contentSelectionTable.value.addOrRefreshRecordId(data.id)
                    toast.add({
                        severity: 'info',
                        summary: 'Updated well contents',
                        detail: 'Well contents updated',
                        life: 1000,
                    })
                } else {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error updating well contents',
                        life: 1000,
                    })
                }
            }
        },
        icon: 'pi pi-fw pi-arrow-right',
        iconPos: 'right',
        tooltip: 'Assign to selected wells',
        disabled: (data: any) => {
            return _.has(data, 'well.id')
        },
    },
}
</script>
<template>
    <Splitter class="h-full mb-8" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
        <SplitterPanel class="overflow-scroll" :size="60">
            <QuickTable
                v-if="tableName && tableWhereClause"
                ref="contentSelectionTable"
                :tableName="tableName"
                schemaName="select"
                :canAdd="false"
                :canDelete="false"
                :canEdit="false"
                :canExport="false"
                :withClause="_.get(displayWithClause, tableName, {})"
                :where="tableWhereClause"
                :columnDefs="_.get(columnDefs, tableName)"
                :rowActions="plateType != 'seq-index' ? rowActions: {}"
                :showColumnFilters="true"
                emptyMessage=""
                v-model:frozenRecordIds="frozenRecordIds">
            </QuickTable>
        </SplitterPanel>
        <SplitterPanel class="flex justify-center overflow-scroll mt-10" :size="40" :minSize="25">
            <PlateDiagram
                ref="plateDiagram"
                v-if="plateWithPlateDiagramWells"
                v-model="plateWithPlateDiagramWells"
                :plateType="plateWithPlateDiagramWells.plateType"
                :sizeX="plateWithPlateDiagramWells.sizeX"
                :sizeY="plateWithPlateDiagramWells.sizeY"
                @well-range-selected="wellRangeSelected"
                @well-selection-cleared="wellSelectionCleared"
                @all-wells-selected="selectedAllWells"
                @well-contents-updated="updatedWellContents" >
                <template #header>
                    {{ plateWithPlateDiagramWells.name }}
                </template>
                <template v-if="plateWithPlateDiagramWells?.plateType == 'preseq-1'" #button1>
                    <Button
                        class="p-button-secondary"
                        icon="pi pi-star"
                        v-tooltip="{value: 'Auto-layout', showDelay: 500}"
                        :disabled="_.isEmpty(contentSelectionTable?.selectedRecords)"
                        @click="layoutPreseq1" />
                </template>
                <template v-if="plateWithPlateDiagramWells?.plateType != 'seq-index'" #button2>
                    <Button
                        class="p-button-secondary"
                        icon="pi pi-trash"
                        v-tooltip="{value: 'Empty selected wells', showDelay: 500}"
                        :disabled="_.isEmpty(selectedWells)"
                        @click="emptySelectedWells" />
                </template>
            </PlateDiagram>
        </SplitterPanel>
    </Splitter>
</template>
