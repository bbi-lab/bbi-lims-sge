<script setup lang="ts">
import _ from 'lodash'
import { VALID_WELL_COLORS, wellCoordinateToChar, type PlateDiagramWell } from '@/composables/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import type { PlateWithPlateDiagramWells } from '~/components/PlateDiagram.vue'
import type { Well } from '~/server/db/schema/sge/well'

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()

const plateWithWells = ref()
const amplificationPrimersTable = ref()
const plateWithPlateDiagramWells: Ref<PlateWithPlateDiagramWells | undefined> = ref()
const plateDiagram = ref()
const selectedWells: Ref<PlateDiagramWell[] | undefined> = ref()

const amplificationPrimerColorMap = computed(() => {
    const amplificationPrimersList = _.uniq(_.compact(_.map(plateWithWells.value?.wells, (well) => {
        return well.amplificationPrimer?.id
    })))
    const colorMap = _.zipObject(amplificationPrimersList, _.map(amplificationPrimersList, (val, idx) => {
        return VALID_WELL_COLORS[idx % VALID_WELL_COLORS.length]
    }))
    return colorMap
})

onMounted(async() => {
    refreshPlate()
})

const refreshPlate = async () => {
    plateWithWells.value = await RecordService.getRecord(
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
                    amplificationPrimer: true,
                }
            }
        }
    )
    const plateDiagramWells: PlateDiagramWell[] = _.map(plateWithWells.value.wells, (well) => {
        const wellContent = well.amplificationPrimer
        const wellContentType = well.amplificationPrimer ? 'AMP' : null
        const wellContentTooltip = wellContent ? `${wellCoordinateToChar(well.y)}${well.x}<br>${wellContent.name} (${wellContentType})` : `${wellCoordinateToChar(well.y)}${well.x}`
        const wellColor = _.get(amplificationPrimerColorMap.value, wellContent?.id)

        const plateDiagramWell: PlateDiagramWell = {
            id: well.id,
            x: well.x,
            y: well.y,
            data: well,
            color: wellColor,
            tooltip: wellContentTooltip,
        }
        return plateDiagramWell
    })
    // replace wells from data model with plateDiagramWells to include visualization properties
    plateWithPlateDiagramWells.value = {
        ...plateWithWells.value,
        wells: plateDiagramWells,
    }
}

const displayWithClause = Object.freeze({
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
    storageBox: {
        columns: {
            name: true
        }
    },
    well: {
        columns: {
            x: true,
            y: true,
        },
        with: {
            plate: {
                columns: {
                    name: true
                }
            }
        }
    },
})

const columnDefs = {
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
    storageBoxId: {
        header: 'Storage',
        format: (x: any) => { return _.compact([_.get(x, 'storageBox.name', '') ,_.get(x, 'storageBoxLoc', '')]).join(': ')},
        path: 'storageBoxId.displayValue',
        type: 'string',
        index: 4,
    },
    storageBoxLoc: {
        display: false
    },
    well: {
        header: 'Plate: Well',
        format: (x: any) => { return _.has(x, 'well.plate') ? ` ${_.get(x, 'well.plate.name')}: ${wellCoordinateToChar(x.well?.y)}${x.well?.x}` : ''},
        path: 'well.displayValue',
        type: 'string',
        index: 5,
    },
}

const wellRangeSelected = function(wells: PlateDiagramWell[]) {
    selectedWells.value = wells
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
const wellSelectionCleared = function() {
    selectedWells.value = []
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 1000,
    })
}
const actionOnSelectedWells = function() {
    toast.add({
        severity: 'info',
        summary: 'Well action',
        detail: `You performed an action on ${selectedWells.value?.length || 0} wells`,
        life: 1000,
    })
}
const updatedWellContents = function(newValues: PlateDiagramWell[], oldValues: PlateDiagramWell[]) {
    const amplifcationPrimerIdsToRefresh = _.compact([
        ..._.map(newValues || [], (well) => { return well.data?.amplificationPrimerId || well.data?.amplificationPrimer?.id}),
        ..._.map(oldValues || [], (well) => { return well.data?.amplificationPrimerId || well.data?.amplificationPrimer?.id}),
    ])
    amplifcationPrimerIdsToRefresh.forEach((id) => {
        amplificationPrimersTable.value.addOrRefreshRecordId(id)
    })
}
const emptySelectedWells = async () => {
    const oldValues = _.cloneDeep(selectedWells.value)
    const updatedRecords = await RecordService.updateRecords(
        `${config.public.apiBase}/wells`,
        _.map(selectedWells.value, (well) => well.id),
        {
            amplificationPrimerId: null,
        }
    ) as Well[]
    if (!_.isEmpty(updatedRecords)) {
        await refreshPlate()
        plateDiagram.value.updateWellContents(
            _.map(updatedRecords || [], (updatedRecord: Well) => {
                return {
                    id: updatedRecord.id,
                    x: updatedRecord.x,
                    y: updatedRecord.y,
                    data: updatedRecord,
                    color: null,
                    tooltip: `${wellCoordinateToChar(updatedRecord.y)}${updatedRecord.x}`,
                }
            }),
            oldValues
        )
        toast.add({
            severity: 'info',
            summary: 'Updated well',
            detail: `Emptied ${_.size(updatedRecords)} wells`,
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
            if (_.size(selectedWells.value) != 1) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Select a single well to add contents',
                    life: 1000,
                })
            } else {
                const oldValues = _.cloneDeep(selectedWells.value)
                const updatedRecord = await RecordService.updateRecord(
                    `${config.public.apiBase}/wells`,
                    {
                        id: _.get(selectedWells.value, [0, 'id']),
                        amplificationPrimerId: data.id,
                    }
                )
                if (updatedRecord?.id) {
                    await refreshPlate()
                    selectedWells.value = [{
                        id: updatedRecord.id,
                        x: updatedRecord.x,
                        y: updatedRecord.y,
                        data: updatedRecord,
                        color: _.get(amplificationPrimerColorMap.value, data.id),
                        tooltip: `${wellCoordinateToChar(updatedRecord.y)}${updatedRecord.x}<br>${data.name} (AMP)`,
                    }]
                    plateDiagram.value.updateWellContents(
                        selectedWells.value,
                        oldValues
                    )
                    amplificationPrimersTable.value.addOrRefreshRecordId(data.id)
                    toast.add({
                        severity: 'info',
                        summary: 'Updated well',
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
        tooltip: 'Assign to well',
    },
}
</script>
<template>
    <Splitter class="h-full mb-8">
        <SplitterPanel class="overflow-scroll" :size="60">
            <QuickTable
                ref="amplificationPrimersTable"
                tableName="amplification-primers"
                schemaName="select"
                :canAdd="false"
                :canDelete="false"
                :canEdit="false"
                :canExport="false"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
            />
        </SplitterPanel>
        <SplitterPanel class="flex justify-center overflow-scroll mt-10" :size="40" :minSize="25">
            <PlateDiagram
                ref="plateDiagram"
                v-if="plateWithPlateDiagramWells"
                v-model="plateWithPlateDiagramWells"
                @well-range-selected="wellRangeSelected"
                @well-selection-cleared="wellSelectionCleared"
                @all-wells-selected="selectedAllWells"
                @well-contents-updated="updatedWellContents" >
                <template #header>
                    {{ plateWithPlateDiagramWells.name }}
                </template>
                <template #button1>
                    <Button
                        class="p-button-secondary"
                        icon="pi pi-star"
                        v-tooltip="{value: 'Action on selected wells', showDelay: 500}"
                        :disabled="_.isEmpty(selectedWells)"
                        @click="actionOnSelectedWells" />
                </template>
                <template #button2>
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
