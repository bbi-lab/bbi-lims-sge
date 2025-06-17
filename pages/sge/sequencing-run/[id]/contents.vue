<script setup lang="ts">
import { wellCoordinateToChar } from '~/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import _ from 'lodash'

const route = useRoute()
const config = useRuntimeConfig()
const sequencingRun = ref()
const sequcingRunWellContentsTable = ref()

onMounted(async () => {
    sequencingRun.value = await RecordService.getRecord(`${config.public.apiBase}/sequencing-runs`, route.params.id as string, {})
})

const invalidRecords = computed(() => {
    const allRecords = sequcingRunWellContentsTable.value?.records || []

    const countByIndexPrimers = _.countBy(_.filter(allRecords, (x) => x.indexPrimerIds), 'indexPrimerIds')
    const primersUsedMoreThanOnce = _.keys(_.pickBy(countByIndexPrimers, (count) => count > 1))

    const invalidRecords = _.compact(_.map(sequcingRunWellContentsTable.value?.records, (x) => {
        const messages = []
        if (_.includes(primersUsedMoreThanOnce, _.join(x.indexPrimerIds, ','))) {
            messages.push('Repeated index primers')
        }
        if (_.isEmpty(x.indexPrimerIds)) {
            messages.push('Missing index primers')
        } else if (_.size(x.indexPrimerIds) > 2) {
            messages.push('Too many index primers in well')
        }
        if (_.isEmpty(x.nucleicAcidIds)) {
            messages.push('Missing nucleic acid')
        } else if (_.size(x.nucleicAcidIds) > 1) {
            messages.push('Too many nucleic acids in well')
        }

        if (_.isEmpty(messages)) {
            return null
        } else {
            return {
                id: x.id,
                messages
            }
        }
    }))
    return _.mapValues(_.keyBy(invalidRecords, 'id'), (x) => _.omit(x, 'id'))
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
        ref="sequcingRunWellContentsTable"
        v-if="sequencingRun"
        tableName="view-sequencing-run-well-contents"
        schemaName="select"
        :canAdd="false"
        :canEdit="false"
        :canDelete="false"
        :columnDefs="columnDefs"
        :invalidRecords="invalidRecords"
        :where="{'==': [{'var': 'sequencingRunId'}, sequencingRun.id]}"
    >
        <template #title>
            <span class="text-2xl font-bold m-0">Sequencing run: {{ sequencingRun.name }}</span>
        </template>
    </QuickTable>
</template>
