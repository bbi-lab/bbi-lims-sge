<script setup lang="ts">
import { makePlateDiagram, type PlateDiagramWell } from '@/composables/lib/plate-diagram'
import _ from 'lodash'
import PhSelectionSlash from '~icons/ph/selection-slash'
import PhSelectionAllFill from '~icons/ph/selection-all-fill'

const plateDiagram = ref()
const plateDiagramDiv = ref()

const props = defineProps({
    showSidebar: {
        type: Boolean,
        default: true,
    },
    showSelectAllButton: {
        type: Boolean,
        default: true,
    },
    showClearSelectionButton: {
        type: Boolean,
        default: true,
    },
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
        <div class="w-fit">
            <div ref="plateDiagramDiv"></div>
        </div>
        <div v-if="showSidebar" class="flex flex-col justify-center items-center">
            <Button v-if="showSelectAllButton" v-tooltip="{value: 'Select all wells', showDelay: 500}" @click="allWellsSelected" severity="secondary">
                <template #icon>
                    <PhSelectionAllFill />
                </template>
            </Button>
            <Button v-if="showClearSelectionButton" v-tooltip="{value: 'Clear selected wells', showDelay: 500}" @click="wellSelectionCleared" severity="secondary">
                <template #icon>
                    <PhSelectionSlash />
                </template>
            </Button>
        </div>
    </div>
</template>
