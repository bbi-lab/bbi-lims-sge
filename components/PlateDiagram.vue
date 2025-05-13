<script setup lang="ts">
import { makePlateDiagram, type PlateDiagram, type PlateDiagramWell } from '@/composables/lib/plate-diagram'
import _ from 'lodash'
import PhSelectionSlash from '~icons/ph/selection-slash'
import PhSelectionAllFill from '~icons/ph/selection-all-fill'
import type { Plate, PlateType } from '~/server/db/schema/sge/plate'

export type PlateWithPlateDiagramWells = Plate & {
    wells: PlateDiagramWell[]
}
const plateDiagram = ref<PlateDiagram>()
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
    plateType: {
        type: String as PropType<PlateType>,
        required: true,
    },
    wellSpecs: {
        type: Object,
    },
    sizeX: {
        type: Number,
        default: 12,
    },
    sizeY: {
        type: Number,
        default: 8,
    },
})

const rotated = ref(false)

const plateDiagramClasses = computed(() => {
    return rotated.value ? "z-10 mt-[calc(25%)] rotate-90 w-80" : "z-10 w-80"
})

const emit = defineEmits([
    'well-range-selected',
    'well-selection-cleared',
    'all-wells-selected',
    'well-contents-updated',
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
    emit('all-wells-selected', modelValue.value?.wells)
}

onMounted(async() => {
    if (modelValue.value){
        if (plateDiagramDiv.value) {
            plateDiagram.value = makePlateDiagram(props.plateType, props.sizeX, props.sizeY)
                .wells(modelValue.value.wells)
                .render(plateDiagramDiv.value)
                .wellRangeSelected(wellRangeSelected) as PlateDiagram
        }
    }
})

const updateWells = (newValues: PlateDiagramWell[], oldValues: PlateDiagramWell[]) => {
    plateDiagram.value?.updateWellContents(newValues)
    emit('well-contents-updated', newValues, oldValues)
}

defineExpose({
    updateWells,
})
</script>

<template>
    <div class="w-fit">
        <div class="flex justify-center">
            <slot name="header" />
        </div>
        <div class="flex">
            <div ref="plateDiagramDiv" :class="plateDiagramClasses"></div>
            <div v-if="showSidebar" class="flex flex-col z-0">
                <Button v-if="showSelectAllButton" v-tooltip="{value: 'Select all wells', showDelay: 500}" @click="allWellsSelected" severity="secondary">
                    <template #icon>
                        <PhSelectionAllFill />
                    </template>
                </Button>
                <Button v-if="showClearSelectionButton" v-tooltip="{value: 'Clear selection', showDelay: 500}" @click="wellSelectionCleared" severity="secondary">
                    <template #icon>
                        <PhSelectionSlash />
                    </template>
                </Button>
                <Button icon="pi pi-refresh" v-tooltip="{value: 'Rotate', showDelay: 500}" @click="rotated = !rotated" severity="secondary" />
                <slot name="button1" />
                <slot name="button2" />
                <slot name="button3" />
            </div>
        </div>
    </div>
</template>

<style>
.tooltip:empty {
    display: none;
}
</style>
