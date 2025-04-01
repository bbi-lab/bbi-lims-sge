<script setup lang="ts">
import _ from 'lodash'
import type { PlateDiagram, PlateDiagramWell } from '@/composables/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import type { Plate } from '~/server/db/schema/sge/plate'

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()

const plate: Ref<Plate | undefined> = ref()

const selectedWells: Ref<PlateDiagramWell[] | undefined> = ref()

onMounted(async() => {
    plate.value = await RecordService.getRecord(
        `${config.public.apiBase}/plates`,
        route.params.id as string,
        {wells: {columns: {x: true, y: true}}}
    )
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
    <PlateDiagram
        v-if="plate"
        v-model="plate"
        @well-range-selected="wellRangeSelected"
        @well-selection-cleared="wellSelectionCleared"
        @all-wells-selected="selectedAllWells">
        <template #header>
            {{ plate.name }}
        </template>
        <template #button1>
            <Button
                v-if="plate"
                variant="text"
                icon="pi pi-star"
                v-tooltip="{value: 'Action on selected wells', showDelay: 500}"
                :disabled="_.isEmpty(selectedWells)"
                @click="actionOnSelectedWells" />
        </template>
    </PlateDiagram>
</template>
