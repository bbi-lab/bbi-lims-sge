
<script setup lang="ts">
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'

const config = useRuntimeConfig()
const crudTable = useCrudTable()
const route = useRoute()
const {user} = useUserSession()

const tableKey = ref<string>(uuidv4())
const whereClauses = ref()
const readonlyValues = ref<Record<string, any>>({})
const showCalcsInfo = ref(false)

watch(() => route.query, async (newValue, oldValue) => {
    const queryParamFilters = _.map(newValue, (val, key) => {
        return {"==": [{"var": key}, val] }
    })
    whereClauses.value = _.size(queryParamFilters) > 1 ? {and: queryParamFilters} : queryParamFilters
    readonlyValues.value = newValue
    tableKey.value = uuidv4()
}, { immediate: true })

const columnDefs = {
    name: {
        index: 0,
    },
    snvLibCloningExperiment: {
        header: 'SNVlib Cloning Experiment',
        type: 'element',
        element: (data: any) => {
            const href = data.snvLibCloningExperimentId ? `/sge/snv-lib-cloning-experiments?id=${data.snvLibCloningExperimentId}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">${data.snvLibCloningExperimentName}</a>` : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'snvLibCloningExperimentName', '')
        },
        index: 1,
    },
    snvLibCloningExperimentId: { display: false },
    snvLibCloningExperimentName: { display: false },
    ampProductId: { display: false },
    linProductId: { display: false },
    linProductVectorAmount: {
        header: 'LIN Product Vector Amount (ng)',
        index: 3,
    },
    quant: {
        header: 'Quant (ng/µL)',
        index: 4,
    },
    gibsonOn: {
        index: 5,
    },
    gibsonByName: {
        header: 'Gibson By',
        index: 6,
    },
    cleanedOn: {
        index: 7,
    },
    cleanedByName: {
        header: 'Cleaned By',
        index: 8,
    },
    transformedOn: {
        index: 9,
    },
    transformedByName: {
        header: 'Transformed By',
        index: 10,
    },
    preppedOn: {
        index: 11,
    },
    preppedByName: {
        header: 'Prepped By',
        index: 12,
    },
    plasmidsaurusChecked: {
        header: 'Plasmidsaurus Checked',
        index: 13,
    },
    ngsChecked: {
        header: 'NGS Checked',
        index: 14,
    },
    passedQc: {
        header: 'Passed QC',
        index: 15,
    },
    benchlingLink: {
        format: 'hyperlink',
        index: 16,
    },
    notes: {
        index: 17,
    },
    ampProductName: {
        header: 'AMP Product Name',
        bodyClass: 'italic font-bold',
    },
    ampProductSize: {
        header: 'AMP Product Size (bp)',
        bodyClass: 'italic font-bold',
    },
    ampProductConcentration: {
        header: 'AMP Product Conc. (ng/µL)',
        bodyClass: 'italic font-bold',
    },
    linProductName: {
        header: 'LIN Product Name',
        bodyClass: 'italic font-bold',
    },
    linProductConcentration: {
        header: 'LIN Product Conc. (ng/µL)',
        bodyClass: 'italic font-bold',
    },
    linProductSize: {
        header: 'LIN Product Size (bp)',
        bodyClass: 'italic font-bold',
    },
    ampProductVectorAmount: {
        header: 'AMP Product Vector Amount (ng)',
        bodyClass: 'italic font-bold',
        format: (data: any) => {
            return data.ampProductVectorAmount ? _.round(data.ampProductVectorAmount, 1) : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'ampProductVectorAmount')
        },
        path: 'ampProductVectorAmount.displayValue',
    },
    ampVolume: {
        header: 'AMP Volume (µL)',
        bodyClass: 'italic font-bold',
        format: (data: any) => {
            return data.ampVolume ? _.round(data.ampVolume, 1) : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'ampVolume.originalValue')
        },
        path: 'ampVolume.displayValue',
    },
    linVolume: {
        header: 'LIN Volume (µL)',
        bodyClass: 'italic font-bold',
        format: (data: any) => {
            return data.linVolume ? _.round(data.linVolume, 1) : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'linVolume.originalValue')
        },
        path: 'linVolume.displayValue',
    },
    totalVolume: {
        header: 'Total Volume (µL)',
        bodyClass: 'italic font-bold',
        format: (data: any) => {
            return data.totalVolume ? _.round(data.totalVolume, 1) : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'totalVolume.originalValue')
        },
        path: 'totalVolume.displayValue',
    },
    totalReactionVolume: {
        header: 'Total Reaction Volume (µL)',
    },
    twoXNebuilderReagentVolume: {
        header: '2X NEBuilder Reagent Volume (µL)',
        bodyClass: 'italic font-bold',
        format: (data: any) => {
            return data.twoXNebuilderReagentVolume ? _.round(data.twoXNebuilderReagentVolume, 1) : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'twoXNebuilderReagentVolume.originalValue')
        },
        path: 'twoXNebuilderReagentVolume.displayValue',
    },
    ncWaterVolume: {
        header: 'NC Water Volume (µL)',
        bodyClass: 'italic font-bold',
        format: (data: any) => {
            return data.ncWaterVolume ? _.round(data.ncWaterVolume, 1) : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'ncWaterVolume.originalValue')
        },
        path: 'ncWaterVolume.displayValue',
    },
    h2oVolume: {
        header: 'H2O Volume (µL)',
        bodyClass: 'italic font-bold',
        format: (data: any) => {
            return data.h2oVolume ? _.round(data.h2oVolume, 1) : null
        },
        exportValue: (data: any) => {
            return _.get(data, 'h2oVolume.originalValue')
        },
        path: 'h2oVolume.displayValue',
    },
}
const fieldDefs: FieldDefinitions = {
    name: {
        index: 0,
    },
    snvLibCloningExperimentId: {
        label: 'SNVlib Cloning Experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/snv-lib-cloning-experiments`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
        index: 1,
    },
    linProductVectorAmount: {
        label: 'LIN Product Vector Amount (ng)',
        props:{
            defaultValue: 50,
        },
        index: 2,
    },
    gibsonBy: {
        label: 'Gibson By',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
    },
    transformedBy: {
        label: 'Transformed By',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
    },
    cleanedBy: {
        label: 'Cleaned By',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
    },
    preppedBy: {
        label: 'Prepped By',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/users`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        },
    },
    quant: {
        label: 'Quant (ng/µL)',
    },
    ngsChecked: {
        label: 'NGS Checked',
    },
    passedQc: {
        label: 'Passed QC',
    },
    totalReactionVolume: {
        label: 'Total Reaction Volume (µL)',
        props:{
            defaultValue: 10,
        },
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="view-snv-lib-gibson-products"
                schemaName="select"
                title="SNVlib Gibson products"
                :columnDefs="columnDefs"
                :where="whereClauses"
                :canEditMultiple="true"
                :canDelete="false"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
            >
                <template #header-buttons>
                    <Button
                        icon="pi pi-info-circle"
                        severity="info"
                        label="Calcs"
                        @click="showCalcsInfo = true"
                    />
                </template>
            </QuickTable>
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="snv-lib-gibson-products"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                :values="{
                    preppedOn: new Date(),
                    preppedBy: _.get(user, 'id'),
                    puc19VectorAmount: 50,
                }"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="snv-lib-gibson-products"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="snv-lib-gibson-products"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
    <Dialog
        v-model:visible="showCalcsInfo"
        header="SNVlib Gibson product calculations"
        :modal="true"
        :closable="true"
        :style="{width: '50vw'}"
    >
        <template #closebutton>
            <Button icon="pi pi-times" class="p-button-text" severity="secondary" @click="showCalcsInfo = false" />
        </template>
        <div class="mb-4">
            The following calculations are used for SNVlib Gibson products:
        </div>
        <ul class="list-disc list-inside mb-4">
            <li>AMP product size (bp) = AMP product stop position - AMP product start position + 1</li>
            <li>LIN product size (bp) = HA PCR product size (bp) + pUC19 vector size (bp) - AMP product size (bp)</li>
            <li>AMP product vector amount (ng) = 7 * AMP product size (bp) / LIN product size (bp) * LIN product vector amount (ng)</li>
            <li>AMP volume (µL) = AMP product vector amount (ng) / AMP product concentration (ng/µL)</li>
            <li>LIN volume (µL) = LIN product vector amount (ng) / LIN product concentration (ng/µL)</li>
            <li>Total volume (µL) = AMP volume (µL) + LIN volume (µL)</li>
        </ul>
        <div>Precise values are used for calculations, and rounded to 1 decimal place for display.</div>
        <div>For reference, the pUC19 vector size is <i><b>2649</b></i> bp.</div>
        <div>AMP product concentration: AMP product quant </div>
        <div>LIN product concentration: LIN product quant </div>
    </Dialog>
</template>
