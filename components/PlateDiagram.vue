<script setup lang="ts">
import makePlateDiagram, { type PlateDiagram } from '@/composables/lib/plate-diagram'

import _ from 'lodash'
import { RecordService } from '@/utils/service/RecordService'
import type { ModelRef } from 'vue'
import { plates } from '~/server/db/schema/sge/plate'

const config = useRuntimeConfig()

const plate: Ref<PlateDiagram | undefined> = ref()

const plateDiagramDiv = ref()

const props = defineProps({

})

const emit = defineEmits([
    'well-selected',
    'row-selection',
    'column-click',
    'well-range-selected',
])

onMounted(async() => {
    plate.value = makePlateDiagram({x: 12, y: 8})
        .render(plateDiagramDiv.value)
})
</script>


<template>
    <div class="flex justify-center">
        <div ref="plateDiagramDiv" />
    </div>
</template>
