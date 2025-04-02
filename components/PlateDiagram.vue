<script setup lang="ts">
import { makePlateDiagram, type PlateDiagramWell } from '@/composables/lib/plate-diagram'
import _ from 'lodash'
import PhSelectionSlash from '~icons/ph/selection-slash'
import PhSelectionAllFill from '~icons/ph/selection-all-fill'
import type { Plate } from '~/server/db/schema/sge/plate'

export type PlateWithPlateDiagramWells = Plate & {
    wells: PlateDiagramWell[]
}
const plateDiagram = ref()
const plateDiagramDiv = ref()
const modelValue = defineModel<PlateWithPlateDiagramWells>()

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
    if (modelValue.value){
        plateDiagram.value = await makePlateDiagram(modelValue.value)
            .render(plateDiagramDiv.value)
            .wellRangeSelected(wellRangeSelected)
    }
})
</script>

<template>
    <div class="w-fit">
        <div class="flex justify-center">
            <slot name="header" />
        </div>
        <div class="flex">
            <div ref="plateDiagramDiv" class="z-10"></div>
            <div v-if="showSidebar" class="flex flex-col z-0">
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
                <slot name="button1" />
                <slot name="button2" />
                <slot name="button3" />
            </div>
        </div>
    </div>
</template>
