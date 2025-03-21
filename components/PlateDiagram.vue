<script setup lang="ts">
import { makePlateDiagram, type PlateDiagramWell } from '@/composables/lib/plate-diagram'
import _ from 'lodash'

const config = useRuntimeConfig()

const plate = ref()
const plateDiagramDiv = ref()

const props = defineProps({

})

const emit = defineEmits([
    'well-range-selected',
])

function wellRangeSelected(wells: PlateDiagramWell[]) {
    emit('well-range-selected', wells)
}

onMounted(async() => {
    plate.value = makePlateDiagram({x: 12, y: 8})
        .render(plateDiagramDiv.value)
        .wellRangeSelected(wellRangeSelected)
})
</script>


<template>
    <div class="flex justify-center">
        <div ref="plateDiagramDiv" />
    </div>
</template>
