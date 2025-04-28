<script setup lang="ts">
import _ from 'lodash'
import type { PlateWithPlateDiagramWells } from '~/components/PlateDiagram.vue'
import { VALID_WELL_COLORS, wellCoordinateToChar, type PlateDiagram, type PlateDiagramWell } from '~/composables/lib/plate-diagram'
import type { NucleicAcid } from '~/server/db/schema/sge/nucleic-acid'
import type { Pellet } from '~/server/db/schema/sge/pellet'
import type { homologyArmPrimers, linearizationPrimers } from '~/server/db/schema/sge/primer'
import { RecordService } from '~/utils/service/RecordService'
import { updateColorMap, type PlateDiagramColorMap, type PlateWithWellContents } from '~/utils/sge/plateUtils'

const unpooledPlateWithWellContents = ref<PlateWithWellContents>()
const pooledPlateWithWellContents = ref<PlateWithWellContents>()
const unpooledPlateDiagram = ref()
const pooledPlateDiagram = ref()
const unpooledPlateWithPlateDiagramWells = ref<PlateWithPlateDiagramWells>()
const pooledPlateWithPlateDiagramWells = ref<PlateWithPlateDiagramWells>()
const wellsToPoolFrom = ref<PlateDiagramWell[]>([])
const wellsToPoolTo = ref<PlateDiagramWell[]>([])

const unpooledPlateColorMap = ref<PlateDiagramColorMap>({})
const pooledPlateColorMap = ref<PlateDiagramColorMap>({})

const config = useRuntimeConfig()
const route = useRoute()
const toast = useToast()

const wellsToPoolFromContent = computed(() => {
    return wellsToPoolFrom.value.map(({data}) => {
        const wellContent = data.wellContents?.[0]?.nucleicAcid
        const wellContentType = data.wellContents?.[0]?.nucleicAcid ? 'DNA' : null
        return {
            content: wellContent,
            contentType: wellContentType,
        }
    })
})

onMounted(async() => {
    await refreshPlates()
})

const refreshPlates = async () => {
    await refreshPlate(route.params.unpooledPlateId as string, unpooledPlateWithWellContents, unpooledPlateWithPlateDiagramWells, unpooledPlateColorMap)
    await refreshPlate(route.params.pooledPlateId as string, pooledPlateWithWellContents, pooledPlateWithPlateDiagramWells, pooledPlateColorMap)
}

const refreshPlate = async (
    plateId: string,
    plateWithWellContents: Ref<PlateWithWellContents | undefined>,
    plateWithPlateDiagramWells: Ref<PlateWithPlateDiagramWells | undefined>,
    plateDiagramColorMap: Ref<PlateDiagramColorMap>) =>
{
    plateWithWellContents.value = await RecordService.getRecord(
        `${config.public.apiBase}/plates`,
        plateId,
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
                            nucleicAcid: {
                                with: {
                                    pellet: true,
                                }
                            },
                        }
                    },
                }
            }
        }
    )
    if (plateWithWellContents.value) {
        updateColorMap(plateDiagramColorMap.value, plateWithWellContents.value)
        const plateDiagramWells: PlateDiagramWell[] = _.map(plateWithWellContents.value.wells, (well) => {
            let wellContent: NucleicAcid & {pellet: Pellet} | undefined
            let wellSymbol
            const wellContentTypeShortName = 'DNA'

            // TODO - handle wells with multiple contents
            wellContent = _.get(well, ['wellContents', 0, 'nucleicAcid'])
            const wellContentName = wellContent?.pellet?.name


            const wellContentTooltip = wellContent ? `${wellCoordinateToChar(well.y)}${well.x}<br>${wellContentName} (${wellContentTypeShortName})` : `${wellCoordinateToChar(well.y)}${well.x}`
            const wellColor = wellContent ? _.get(plateDiagramColorMap.value, [wellContent?.id, 'color']) : undefined

            const plateDiagramWell: PlateDiagramWell = {
                id: well.id,
                x: well.x,
                y: well.y,
                data: well,
                color: wellColor,
                symbol: wellSymbol,  // should be F or R for amplification primers
                tooltip: wellContentTooltip,
            }
            return plateDiagramWell as PlateDiagramWell
        })
        plateWithPlateDiagramWells.value = {
            ...plateWithWellContents.value,
            wells: plateDiagramWells,
        }
    }
}

const unpooledPlateWellRangeSelected = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'Selection Updated',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
    wellsToPoolFrom.value = wells
}
const unpooledPlateWellSelectionCleared = () => {
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 1000,
    })
    wellsToPoolFrom.value = []
}
const unpooledPlateSelectAllWells = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'All Wells Selected',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
    wellsToPoolFrom.value = wells
}
const unpooledPlateUpdatedWellContents = (event: any) => {
    console.log(event)
}
const pooledPlateWellRangeSelected = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'Selection Updated',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
    wellsToPoolTo.value = wells
}
const pooledPlateWellSelectionCleared = () => {
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 1000,
    })
    wellsToPoolTo.value = []
}
const pooledPlateSelectAllWells = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'All Wells Selected',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
    wellsToPoolTo.value = wells
}
const pooledPlateUpdatedWellContents = (event: any) => {
    console.log(event)
}

const poolSelectedWells = async () => {
    const destinationWell = wellsToPoolTo.value[0]
    const oldValues = _.cloneDeep(wellsToPoolTo.value)

    for (const sourceWell of wellsToPoolFrom.value) {
        const wellContentId = sourceWell.data.wellContents?.[0]?.id
        const nucleicAcid = sourceWell.data.wellContents?.[0]?.nucleicAcid

        const updatedRecord = await RecordService.updateRecord(
            `${config.public.apiBase}/wellContents`,
            {
                id: wellContentId,
                wellId: destinationWell.id,
            }
        )

        await refreshPlates()
        const updatedWell = _.find(pooledPlateWithWellContents.value?.wells, (well) => well.id === destinationWell.id)
        if (updatedWell) {
            const wellContentTypeShortName = 'DNA'
            const wellContentName = nucleicAcid.pellet?.name
            wellsToPoolTo.value = [{
                id: updatedWell.id,
                x: updatedWell.x,
                y: updatedWell.y,
                data: updatedWell,
                color: _.get(pooledPlateColorMap.value, [nucleicAcid.id, 'color']),
                tooltip: `${wellCoordinateToChar(updatedWell.y)}${updatedWell.x}<br>${wellContentName} (${wellContentTypeShortName})`,
            }]
            pooledPlateDiagram.value.updateWellContents(
                wellsToPoolTo.value,
                oldValues
            )
        }
    }
}
</script>
<template>
    <div class="flex justify-center"><h3>Pooling</h3></div>
    <div class="flex flex-row justify-evenly">
        <PlateDiagram
            ref="unpooledPlateDiagram"
            v-if="unpooledPlateWithPlateDiagramWells"
            v-model="unpooledPlateWithPlateDiagramWells"
            :plateType="unpooledPlateWithPlateDiagramWells.plateType"
            @well-range-selected="unpooledPlateWellRangeSelected"
            @well-selection-cleared="unpooledPlateWellSelectionCleared"
            @all-wells-selected="unpooledPlateSelectAllWells"
            @well-contents-updated="unpooledPlateUpdatedWellContents" >
            <template #header>
                {{ unpooledPlateWithPlateDiagramWells?.name || '' }}
            </template>
        </PlateDiagram>
        <div class="flex flex-col justify-center">
            <Button
                icon="pi pi-arrow-right"
                severity="info"
                :class="wellsToPoolFrom.length > 0 ? 'visible' : 'invisible'"
                :disabled="wellsToPoolTo.length != 1"
                @click="poolSelectedWells"
            />
        </div>
        <PlateDiagram
            ref="pooledPlateDiagram"
            v-if="pooledPlateWithPlateDiagramWells"
            v-model="pooledPlateWithPlateDiagramWells"
            :plateType="pooledPlateWithPlateDiagramWells.plateType"
            @well-range-selected="pooledPlateWellRangeSelected"
            @well-selection-cleared="pooledPlateWellSelectionCleared"
            @all-wells-selected="pooledPlateSelectAllWells"
            @well-contents-updated="pooledPlateUpdatedWellContents" >
            <template #header>
                {{ pooledPlateWithPlateDiagramWells?.name || '' }}
            </template>
        </PlateDiagram>
    </div>
    <div class="flex flex-col">
        <div class="flex justify-center" v-if="!_.isEmpty(wellsToPoolFrom)">
            <h5>Well contents</h5>
        </div>
        <div v-for="(item, i) in wellsToPoolFromContent">
            <div :key="i" class="flex flex-row">
                <div class="w-1/4 flex justify-center">
                    {{ item.contentType }}
                </div>
                <div class="w-3/4">
                    <div v-for="(value) in _.entries(item.content)">
                        {{ value[0] }} : {{ value[1] }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
