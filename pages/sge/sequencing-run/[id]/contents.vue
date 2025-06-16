<script setup lang="ts">
import { wellCoordinateToChar } from '~/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'

const route = useRoute()
const config = useRuntimeConfig()
const sequencingRun = ref()

onMounted(async () => {
    sequencingRun.value = await RecordService.getRecord(`${config.public.apiBase}/sequencing-runs`, route.params.id as string, {})
})

const columnDefs = {
    pelletNames: {
        header: 'Nucleic acid',
        index: 1,
    },
    indexPrimerSequences: {
        header: 'Index primers',
        index: 2,
    },
    plateName: {
        header: 'Plate',
        index: 3,
    },
    well: {
        header: 'Well',
        index: 4,
        format: (data: any) => {
            return `${wellCoordinateToChar(data.wellY)}${data.wellX}`
        },
        path: 'well.displayValue',
    },
    wellX: { display: false },
    wellY: { display: false },
    plateId: { display: false },
    sequencingRunId: { display: false },
    sequencingRunName: { display: false },
    indexPrimerIds: { display: false },
    nucleicAcidIds: { display: false },
}
</script>
<template>
    <QuickTable
        v-if="sequencingRun"
        tableName="view-sequencing-run-well-contents"
        schemaName="select"
        :canAdd="false"
        :canEdit="false"
        :canDelete="false"
        :columnDefs="columnDefs"
        :where="{'==': [{'var': 'sequencingRunId'}, sequencingRun.id]}"
    >
        <template #title>
            <span class="text-2xl font-bold m-0">Sequencing run: {{ sequencingRun.name }}</span>
        </template>
    </QuickTable>
</template>
