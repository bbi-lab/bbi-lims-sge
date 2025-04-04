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
    const plateDiagramWells = _.map(plateWithWells.wells, (well) => {
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
    plateWithPlateDiagramWells.value = {
        ...plateWithWells,
        wells: plateDiagramWells,
    }
})

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
</script>
<template>
    <div class="flex justify-center w-full mt-10">
        <PlateDiagram
            v-if="plateWithPlateDiagramWells"
            v-model="plateWithPlateDiagramWells"
            :plateType="plateWithPlateDiagramWells.plateType"
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
    </div>
</template>
