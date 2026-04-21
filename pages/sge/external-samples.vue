<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'

const crudTable = useCrudTable()
const config = useRuntimeConfig()
const toast = useToast()
const importDialogVisible = ref(false)

const submitExternalSamples = async (data: any[]) => {
    try {
        const filteredData = _.filter(data, (item) => {
            return !_.includes(_.toLower(item.notes || ''), 'sample row')
        })
        if (_.isEmpty(filteredData)) {
            toast.add({ severity: 'warn', summary: 'No records found', life: 5000 })
            return
        }
        const response: { samples: { id: string }[]; insertedCount: number } = await $fetch(`${config.public.apiBase}/custom/external-samples/import`, {
            method: 'POST',
            body: filteredData,
        })
        crudTable.didAddRecords(response.samples)
        toast.add({ severity: 'success', summary: 'Success', detail: `Successfully imported ${response.insertedCount} External Samples.`, life: 5000 })
        importDialogVisible.value = false
    } catch (error: any) {
        const userMessage = _.isArray(error?.data?.data) ? convertErrorDataToUserMessage(error.data.data) : error.statusMessage ?? 'An unexpected error occurred during import. Please try again.'
        toast.add({ severity: 'error', summary: 'Error', detail: userMessage, life: 5000 })
    }
}

const importExternalSamples = (event: any) => {
    try {
        fileToSheet(event.files[0], submitExternalSamples)
    } catch (error) {
        console.error('Error importing External Samples:', error)
    }
}

const columnDefs: ColumnDefinitions = {
    wellContents: { display: false },
    sequencingRuns: { display: false },
    createdAt: { display: false },
    createdBy: { display: false },
    indexPrimer1Id: { display: false },
    indexPrimer2Id: { display: false },
    customIndexSeq1: {
        header: 'Custom Index Sequence 1'
    },
    customIndexSeq2: {
        header: 'Custom Index Sequence 2'
    },
    indexPrimer1: {
        header: 'Index Primer 1',
        format: (x: any) => `${x.indexPrimer1?.indexSequence} (${x.indexPrimer1?.primerType})`,
        path: 'indexPrimer1.displayValue',
    },
    indexPrimer2: {
        header: 'Index Primer 2',
        format: (x: any) => `${x.indexPrimer2?.indexSequence} (${x.indexPrimer2?.primerType})`,
        path: 'indexPrimer2.displayValue',
    },
}

const fieldDefs: FieldDefinitions = {
    wellContents: { display: false },
    sequencingRuns: { display: false },
    createdBy: { display: false },
    customIndexSeq1: {
        label: 'Custom Index Sequence 1'
    },
    customIndexSeq2: {
        label: 'Custom Index Sequence 2'
    },
    indexPrimer1Id: {
        label: 'Index Primer 1',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/index-primers`,
            searchFields: ['name', 'indexSequence'],
            valueField: 'id',
            inputClass: 'w-80',
            displayFormat: (x: any) => `${x.name}: ${x.indexSequence} (${x.primerType})`,
        }
    },
    indexPrimer2Id: {
        label: 'Index Primer 2',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/index-primers`,
            searchFields: ['name', 'indexSequence'],
            valueField: 'id',
            inputClass: 'w-80',
            displayFormat: (x: any) => `${x.name}: ${x.indexSequence} (${x.primerType})`,
        }
    },
}

const withClause = {
    sequencingRuns: true,
    indexPrimer1: true,
    indexPrimer2: true,
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="external-samples"
                schemaName="select"
                title="External samples"
                :withClause="withClause"
                :columnDefs="columnDefs"
                :canEditMultiple="true"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            >
                <template #header-buttons>
                    <Button
                        v-if="!crudTable.state.showAddForm && !crudTable.state.showEditForm && !crudTable.state.showMultipleEditForm"
                        label="Import"
                        icon="pi pi-file-import"
                        @click="importDialogVisible = true"
                    />
                </template>
            </QuickTable>
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="external-samples"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="external-samples"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="external-samples"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
    <Dialog v-model:visible="importDialogVisible" modal :closable="false" :style="{ width: '35rem' }">
        <slot name="closebutton">
            <div class="flex justify-end">
                <Button icon="pi pi-times" class="p-button-rounded p-button-text p-button-plain ml-auto mr-0" @click="importDialogVisible = false" />
            </div>
        </slot>
        <slot name="header">
            <span class="flex justify-center mt-3 font-bold">Import External Samples</span>
        </slot>
        <a href="/templates/external_samples_import_template.xlsx" download class="flex justify-center mt-3 mb-2 text-primary">Download template</a>
        <div class="flex justify-center">
            <FileUpload
                mode="basic"
                accept="application/msexcel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                class="p-button-info"
                :maxFileSize="1000000"
                :customUpload="true"
                :auto="true"
                @uploader="importExternalSamples"
                chooseLabel="Upload"
            >
                <template #chooseicon>
                    <i class="pi pi-upload"></i>
                </template>
            </FileUpload>
        </div>
    </Dialog>
</template>
