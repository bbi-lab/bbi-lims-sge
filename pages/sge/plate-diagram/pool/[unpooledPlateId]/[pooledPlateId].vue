<script setup lang="ts">
import _ from 'lodash'
import type { PlateWithPlateDiagramWells } from '~/components/PlateDiagram.vue'
import { VALID_WELL_COLORS, wellCoordinateToChar, type PlateDiagramWell } from '~/composables/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'

const unpooledPlateDiagram = ref()
const pooledPlateDiagram = ref()
const unpooledPlateWithPlateDiagramWells: Ref<PlateWithPlateDiagramWells | undefined> = ref()
const pooledPlateWithPlateDiagramWells: Ref<PlateWithPlateDiagramWells | undefined> = ref()

const config = useRuntimeConfig()
const route = useRoute()
const toast = useToast()

onMounted(async() => {
    // Fetch the unpooled plate
    const unpooledPlateWithWells = await RecordService.getRecord(
        `${config.public.apiBase}/plates`,
        route.params.unpooledPlateId as string,
        {
            wells: {
                columns: {
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
    const unpooledPlateDiagramWells = _.map(unpooledPlateWithWells.wells, (well) => {
        const wellContent = well.amplificationPrimer || well.linearizationPrimer || well.homologyArmPrimer
        const wellContentType = well.amplificationPrimer ? 'AMP' : (well.linearizationPrimer ? 'LIN' : (well.homologyArmPrimer ? 'HA' : null))
        const wellContentTooltip = wellContent ? `${wellCoordinateToChar(well.y)}${well.x}<br>${wellContent.name} (${wellContentType})` : `${wellCoordinateToChar(well.y)}${well.x}`
        const wellColor = wellContent ? _.sample(VALID_WELL_COLORS) : undefined

        return {
            x: well.x,
            y: well.y,
            color: wellColor,
            tooltip: wellContentTooltip,
            selected: false,
            inSelectionRange: false,
        }
    })
    // replace wells from data model with plateDiagramWells to include visualization properties
    unpooledPlateWithPlateDiagramWells.value = {
        ...unpooledPlateWithWells,
        wells: unpooledPlateDiagramWells,
    }


    // Fetch the unpooled plate
    const pooledPlateWithWells = await RecordService.getRecord(
        `${config.public.apiBase}/plates`,
        route.params.pooledPlateId as string,
        {
            wells: {
                columns: {
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
    const pooledPlateDiagramWells = _.map(pooledPlateWithWells.wells, (well) => {
        const wellContent = well.amplificationPrimer || well.linearizationPrimer || well.homologyArmPrimer
        const wellContentType = well.amplificationPrimer ? 'AMP' : (well.linearizationPrimer ? 'LIN' : (well.homologyArmPrimer ? 'HA' : null))
        const wellContentTooltip = wellContent ? `${wellCoordinateToChar(well.y)}${well.x}<br>${wellContent.name} (${wellContentType})` : `${wellCoordinateToChar(well.y)}${well.x}`
        const wellColor = wellContent ? _.sample(VALID_WELL_COLORS) : undefined

        return {
            x: well.x,
            y: well.y,
            color: wellColor,
            tooltip: wellContentTooltip,
            selected: false,
            inSelectionRange: false,
        }
    })
    // replace wells from data model with plateDiagramWells to include visualization properties
    pooledPlateWithPlateDiagramWells.value = {
        ...pooledPlateWithWells,
        wells: pooledPlateDiagramWells,
    }
})

const unpooledPlateWellRangeSelected = (event: any) => {
    console.log(event)
}
const unpooledPlateWellSelectionCleared = () => {
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 1000,
    })
}
const unpooledPlateSelectAllWells = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'All Wells Selected',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
}
const unpooledPlateUpdatedWellContents = (event: any) => {
    console.log(event)
}
const pooledPlateWellRangeSelected = (event: any) => {
    console.log(event)
}
const pooledPlateWellSelectionCleared = () => {
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 1000,
    })
}
const pooledPlateSelectAllWells = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'All Wells Selected',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
}
const pooledPlateUpdatedWellContents = (event: any) => {
    console.log(event)
}
</script>
<template>
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
        </PlateDiagram>
        <div></div>
        <PlateDiagram
            ref="pooledPlateDiagram"
            v-if="pooledPlateWithPlateDiagramWells"
            v-model="pooledPlateWithPlateDiagramWells"
            :plateType="pooledPlateWithPlateDiagramWells.plateType"
            @well-range-selected="pooledPlateWellRangeSelected"
            @well-selection-cleared="pooledPlateWellSelectionCleared"
            @all-wells-selected="pooledPlateSelectAllWells"
            @well-contents-updated="pooledPlateUpdatedWellContents" >
        </PlateDiagram>
    </div>
</template>
