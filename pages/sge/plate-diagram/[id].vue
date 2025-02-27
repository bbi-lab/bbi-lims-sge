<script setup lang="ts">
import _ from 'lodash'
import type { PlateDiagram, PlateDiagramWell } from '@/composables/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import {v4 as uuidv4} from 'uuid'

const route = useRoute()
const config = useRuntimeConfig()



const plate: Ref<PlateDiagram | undefined> = ref()
const selectionStartCoordinates: Ref<{x: number, y: number} | undefined> = ref()

onMounted(async() => {
    plate.value = await RecordService.getRecord(
        `${config.public.apiBase}/plates`,
        route.params.id as string,
        {wells: {columns: {x: true, y: true}}}
    )
})
const toggleWell = function(well: PlateDiagramWell) {
    well.selected = !well.selected
}

const toggleWellRange = function(wells: PlateDiagramWell[]) {
    console.log(wells)
    wells.forEach((x) => x.selected = !x.selected)
}

</script>
<template>

<PlateDiagram 
    v-if="plate" 
    v-model="plate"
    @well-click="toggleWell"
    @well-range="toggleWellRange" />

</template>
