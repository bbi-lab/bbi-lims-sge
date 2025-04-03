<script setup lang="ts">
import _ from 'lodash'
import { VALID_WELL_COLORS, wellCoordinateToChar, type PlateDiagramWell } from '@/composables/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import type { PlateWithPlateDiagramWells } from '~/components/PlateDiagram.vue'

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()

const plateWithPlateDiagramWells: Ref<PlateWithPlateDiagramWells | undefined> = ref()

const selectedWells: Ref<PlateDiagramWell[] | undefined> = ref()

onMounted(async() => {
    const plateWithWells = await RecordService.getRecord(
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
                    linearizationPrimer: true,
                    homologyArmPrimer:true,
                }
            }
        }
    )
    const plateDiagramWells: PlateDiagramWell[] = _.map(plateWithWells.wells, (well) => {
        const wellContent = well.amplificationPrimer || well.linearizationPrimer || well.homologyArmPrimer
        const wellContentType = well.amplificationPrimer ? 'AMP' : (well.linearizationPrimer ? 'LIN' : (well.homologyArmPrimer ? 'HA' : null))
        const wellContentTooltip = wellContent ? `${wellCoordinateToChar(well.y)}${well.x}<br>${wellContent.name} (${wellContentType})` : `${wellCoordinateToChar(well.y)}${well.x}`
        const wellColor = wellContent ? _.sample(VALID_WELL_COLORS) : undefined

        const plateDiagramWell: PlateDiagramWell = {
            id: well.id,
            x: well.x,
            y: well.y,
            color: wellColor,
            tooltip: wellContentTooltip,
            selected: false,
            inSelectionRange: false,
        }
        return plateDiagramWell
    })
    // replace wells from data model with plateDiagramWells to include visualization properties
    plateWithPlateDiagramWells.value = {
        ...plateWithWells,
        wells: plateDiagramWells,
    }
})

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
        detail: `You selected ${wells.length} wells`,
        life: 3000,
    })
}

const selectedAllWells = function(wells: PlateDiagramWell[]) {
    selectedWells.value = wells
    toast.add({
        severity: 'info',
        summary: 'All Wells Selected',
        detail: `You selected ${wells.length} wells`,
        life: 3000,
    })
}
const wellSelectionCleared = function() {
    selectedWells.value = []
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 3000,
    })
}
const actionOnSelectedWells = function() {
    toast.add({
        severity: 'info',
        summary: 'Well action',
        detail: `You performed an action on ${selectedWells.value?.length || 0} wells`,
        life: 3000,
    })
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
                    life: 3000,
                })
            } else {
                const updatedRecord = await RecordService.updateRecord(
                    `${config.public.apiBase}/wells`,
                    {
                        id: _.get(selectedWells.value, [0, 'id']),
                        amplificationPrimerId: data.id,
                    }
                )
                if (updatedRecord?.id) {
                    toast.add({
                        severity: 'info',
                        summary: 'Updated well',
                        detail: 'Well contents updated',
                        life: 3000,
                    })
                } else {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error updating well contents',
                        life: 3000,
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
                v-if="plateWithPlateDiagramWells"
                v-model="plateWithPlateDiagramWells"
                @well-range-selected="wellRangeSelected"
                @well-selection-cleared="wellSelectionCleared"
                @all-wells-selected="selectedAllWells">
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
            </PlateDiagram>
        </SplitterPanel>
    </Splitter>
</template>
