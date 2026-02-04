<script setup lang="ts">
import _ from 'lodash'
import { ENUM_LOOKUPS } from '~/server/db/schema/sge/enum-lookups'
import type { PlateType } from '~/server/db/schema/sge/plate'
import { v4 as uuidv4 } from 'uuid'

const router = useRouter()
const route = useRoute()
const crudTable = useCrudTable()
const config = useRuntimeConfig()

const tableKey = ref<string>(uuidv4())
const whereClauses = ref()
const readonlyValues = ref<Record<string, any>>({})

watch(() => route.query, async (newValue, oldValue) => {
    const queryParamFilters = _.map(newValue, (val, key) => {
        return {"==": [{"var": key}, val] }
    })
    whereClauses.value = _.size(queryParamFilters) > 1 ? {and: queryParamFilters} : queryParamFilters
    readonlyValues.value = newValue
    tableKey.value = uuidv4()
}, { immediate: true })

const columnDefs = {
    name: { index: 0},
    plateType: { display: false },
    plateTypeLabel: { header: 'Type', index: 1 },
    pcrExperimentId: { display: false},
    sgRnaCloningExperimentId: { display: false},
    // snvLibCloningExperimentId: { display: false},
    sizeX: { display: false },
    sizeY: { display: false },
    cycleId: { display: false },
    cycleName: { header: 'Cycle', index: 2 },
    targets: { index: 4 },
    wellsCount: { display: false },
    wellsWithContentCount: { display: false },
    wellsProcessedCount: { display: false },
    filled: {
        index: 3,
        format: (data: any) => {
            if (_.isNumber(data.wellsCount) && data.wellsCount > 0 && _.isNumber(data.wellsWithContentCount)) {
                return `${data.wellsWithContentCount} / ${data.wellsCount}`
            } else {
                return '-'
            }
        },
        path: 'filled.displayValue',
    },
    wellsProcessed: {
        header: 'Wells processed',
        index: 3,
        format: (data: any) => {
            return _.includes(['preseq-1', 'preseq-2'], data.plateType) ? data.wellsProcessedCount : ''
        },
        path: 'wellsProcessed.displayValue',
    },
    discarded: { index: 5 },
    processed: { header: 'Plate processed', index: 6 },
}
const rowActions = {
    layout: {
        action: (data: any) => {
            router.push({path:`/sge/plate-layout/${data.plateType}/${data.id}`})
        },
        disabled: ({plateType}: { plateType: PlateType }) => _.includes(['amp-pcr', 'lin-pcr', 'ha-pcr'], plateType)
    },
}

const fieldDefs = {
    pcrExperimentId: { display: false },
    sgRnaCloningExperimentId: { display: false },
    // snvLibCloningExperimentId: { display: false },
    wells: { display: false },
    name: { index: 0 },
    plateType: {
        index: 1,
        component: 'Select',
        props: {
            options: _.sortBy(_.map(ENUM_LOOKUPS.plates.plateType, (value, key) => {
                // disable PCR plate types that should only be generated on experiment creation
                const pattern = /^preseq-|-pcr$|^rna-rt$|^[d|r]na-preseq-/
                if (pattern.test(key)) {
                    return { label: value.label, code: key, disabled: true }
                } else {
                    return { label: value.label, code: key }
                }
            }), 'label'),
            optionLabel: 'label',
            optionValue: 'code',
            optionDisabled: 'disabled',
        },
        events: {
            change: (record: any, recordOld: any) => {
                if (record?.plateType == recordOld?.plateType) return
                if (_.endsWith(record.plateType, '-storage')) {
                    record.sizeX = 9
                    record.sizeY = 9
                } else {
                    record.sizeX = 12
                    record.sizeY = 8
                }
            }
        },
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :key="tableKey"
                :ref="crudTable.setTableRef"
                tableName="view-plates-with-well-counts"
                schemaName="select"
                title="Plates/Storage boxes"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                :where="whereClauses"
                :canDelete="false"
                :showColumnFilters="true"
                :sortBy="['plateTypeLabel', 'name']"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            />
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="plates"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="plates"
                schemaName="update"
                :fieldDefs="{...fieldDefs, plateType: {readOnly: true, index: 1}, sizeX: {readOnly: true}, sizeY: {readOnly: true}}"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
        </SplitterPanel>
    </Splitter>
</template>
