<script setup lang="ts">
import { makePlateDiagram, type PlateDiagramWell } from '@/composables/lib/plate-diagram'
import _ from 'lodash'
import PhSelectionSlash from '~icons/ph/selection-slash'
import PhSelectionAllFill from '~icons/ph/selection-all-fill'

const plateDiagram = ref()
const plateDiagramDiv = ref()

const props = defineProps({

})

const emit = defineEmits([
    'well-range-selected',
    'well-selection-cleared',
    'all-wells-selected',
])

function wellRangeSelected(wells: PlateDiagramWell[]) {
    emit('well-range-selected', wells)
}
function wellSelectionCleared() {
    plateDiagram.value?.clearSelection()
    emit('well-selection-cleared')
}

function allWellsSelected() {
    plateDiagram.value?.selectAllWells()
    emit('all-wells-selected', plateDiagram.value?.wells())
}

onMounted(async() => {
    plateDiagram.value = await makePlateDiagram({x: 12, y: 8})
        .render(plateDiagramDiv.value)
        .wellRangeSelected(wellRangeSelected)
})
</script>

<template>
    <div class="flex justify-center">
        <div ref="plateDiagramDiv"></div>
    </div>
    <div class="flex justify-center">
        <Button v-tooltip="{value: 'Clear selected wells', showDelay: 500}" @click="wellSelectionCleared" severity="secondary" class="content-center">
            <template #icon>
                <PhSelectionSlash />
            </template>
        </Button>
        <Button v-tooltip="{value: 'Select all wells', showDelay: 500}" @click="allWellsSelected" severity="secondary" class="content-center">
            <template #icon>
                <PhSelectionAllFill />
            </template>
        </Button>
    </div>
</template>
