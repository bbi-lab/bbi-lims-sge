<script setup lang="ts">
import _ from 'lodash'
import type { PlateWithPlateDiagramWells } from '~/components/PlateDiagram.vue'
import { VALID_WELL_COLORS, wellCoordinateToChar, type PlateDiagramWell } from '~/composables/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'

const unpooledPlateDiagram = ref()
const pooledPlateDiagram = ref()
const unpooledPlateWithPlateDiagramWells: Ref<PlateWithPlateDiagramWells | undefined> = ref()
const pooledPlateWithPlateDiagramWells: Ref<PlateWithPlateDiagramWells | undefined> = ref()
const wellsToPool = ref<PlateDiagramWell[]>([])

const config = useRuntimeConfig()
const route = useRoute()
const toast = useToast()

const wellsToPoolContent = computed(() => {
    return wellsToPool.value.map(({data}) => {
        const wellContent = data.amplificationPrimer || data.linearizationPrimer || data.homologyArmPrimer
        const wellContentType = data.amplificationPrimer ? 'AMP' : (data.linearizationPrimer ? 'LIN' : (data.homologyArmPrimer ? 'HA' : null))
        return {
            content: wellContent,
            contentType: wellContentType,
        }
    })
})

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
            data: well,
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
            data: well,
        }
    })
    // replace wells from data model with plateDiagramWells to include visualization properties
    pooledPlateWithPlateDiagramWells.value = {
        ...pooledPlateWithWells,
        wells: pooledPlateDiagramWells,
    }
})

const unpooledPlateWellRangeSelected = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
    wellsToPool.value = wells
}
const unpooledPlateWellSelectionCleared = () => {
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 1000,
    })
    wellsToPool.value = []
}
const unpooledPlateSelectAllWells = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'All Wells Selected',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
    wellsToPool.value = wells
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
                :class="wellsToPool.length > 0 ? 'visible' : 'invisible'"
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
        <div class="flex justify-center" v-if="!_.isEmpty(wellsToPool)">
            <h5>Well contents</h5>
        </div>
        <div v-for="(item, i) in wellsToPoolContent">
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
