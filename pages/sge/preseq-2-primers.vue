<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'
import { v4 as uuidv4 } from 'uuid'

const config = useRuntimeConfig()
const crudTable = useCrudTable()
const route = useRoute()

const tableKey = ref<string>(uuidv4())
const whereClauses = ref()
const readonlyValues = ref<Record<string, any>>({})
const importDialogVisible = ref(false)
const toast = useToast()

const submitDnaPreseq2Primers = async (data: any[]) => {
    try {
        // remove items with "Sample row" in the notes field as these are template row
        const filteredData = _.filter(data, (item) => {
            return !_.includes(_.toLower(item.notes || ''), 'sample row')
        })
        if (_.isEmpty(filteredData)) {
            toast.add({ severity: 'warn', summary: 'No records found', life: 5000 })
            return
        }
        const response: { primers: { id: string }[]; insertedCount: number } = await $fetch(`${config.public.apiBase}/custom/primers/preseq2-primers/pcr-primer-import`, {
            method: 'POST',
            body: filteredData,
        })
        crudTable.didAddRecords(response.primers)
        toast.add({ severity: 'success', summary: 'Success', detail: `Successfully imported ${response.insertedCount} DNA PreSeq 2 Primers.`, life: 5000 })
        importDialogVisible.value = false
    } catch (error: any) {
        const userMessage =  _.isArray(error?.data?.data) ? convertErrorDataToUserMessage(error.data.data) : error.statusMessage ?? 'An unexpected error occurred during import. Please try again.'
        toast.add({ severity: 'error', summary: 'Error', detail: userMessage, life: 5000 })
    }
}

const importDnaPreseq2Primers = (event: any) => {
    try {
        const files = event.files
        const f = files[0]

        fileToSheet(f, submitDnaPreseq2Primers)
    } catch (error) {
        console.error('Error importing DNA PreSeq 2 Primers:', error)
    }
}

watch(() => route.query, async (newValue, oldValue) => {
    const queryParamFilters = _.map(newValue, (val, key) => {
        return {"==": [{"var": key}, val] }
    })
    whereClauses.value = _.size(queryParamFilters) > 1 ? {and: queryParamFilters} : queryParamFilters
    readonlyValues.value = newValue
    tableKey.value = uuidv4()
}, { immediate: true })

const displayWithClause = Object.freeze({
    target: {
        columns: {
            name: true
        },
        with: {
            project: {
                columns: {
                    name: true
                }
            },
            region: {
                columns: {
                    name: true
                },
                with: {
                    gene: {
                        columns: {
                            symbol: true
                        }
                    }
                }
            },
        },
    },
    wellable: {
        with: {
            wellContents: {
                with: {
                    well: {
                        columns: {
                            id: true,
                            x: true,
                            y: true,
                        },
                        with: {
                            plate: {
                                columns: {
                                    id: true,
                                    name: true,
                                    plateType: true,
                                }
                            }
                        }
                    },
                },
            },
        }
    }
})

const columnDefs = {
    name: {
        index: 1
    },
    targetId: {
        header: 'Target',
        format: (x: any) => {
            return x.target?.name || (x.target?.region ? `${_.get(x, 'target.region.gene.symbol')} : ${_.get(x, 'target.region.name')}` : '')
        },
        path: 'targetId.displayValue',
        type: 'string',
        index: 2,
    },
    project: {
        format: (x: any) => {
            return x.target?.project?.name || ''
        },
        path: 'project.displayValue',
        index: 3,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            return combinedWellLocations(x) as string
        },
        path: 'wellContents.displayValue',
        type: 'string',
        index: 5,
    },
}

const fieldDefs: FieldDefinitions = {
    targetId: {
        label: 'Target',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/targets`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        }
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :key="tableKey"
                :ref="crudTable.setTableRef"
                tableName="preseq-2-primers"
                schemaName="select"
                title="PreSeq 2 Primers"
                :withClause="displayWithClause"
                :where="whereClauses"
                :columnDefs="columnDefs"
                :canEditMultiple="true"
                :selectionDisabled="crudTable.state.showAddForm || crudTable.state.showEditForm || crudTable.state.showMultipleEditForm"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
                @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
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
                tableName="preseq-2-primers"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="preseq-2-primers"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="crudTable.state.showMultipleEditForm"
                tableName="preseq-2-primers"
                :recordIds="crudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :readonlyValues="readonlyValues"
                @cancel="crudTable.didClickCancelMultipleEditForm"
                @records-update="crudTable.didUpdateMultipleRecords"
            />
        </SplitterPanel>
    </Splitter>
    <Dialog v-model:visible="importDialogVisible" modal :closable="false" :style="{ width: '35' }">
        <slot name="closebutton">
            <div class="flex justify-end">
                 <Button icon="pi pi-times" class="p-button-rounded p-button-text p-button-plain ml-auto mr-0" @click="importDialogVisible = false" />
            </div>
        </slot>
        <slot name="header">
            <span class="flex justify-center mt-3 font-bold">Import DNA PreSeq 2 Primers</span>
        </slot>
        <a href="/templates/pcr2_primer_import_template.xlsx" download class="flex justify-center mt-3 mb-5 text-primary">Download template</a>
        <FileUpload
            mode="basic"
            accept="application/msexcel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
            class="p-button-info"
            :maxFileSize="1000000"
            :customUpload="true"
            :auto="true"
            @uploader="importDnaPreseq2Primers"
            chooseLabel="Upload"
            v-tooltip="{value: 'Upload DNA PreSeq 2 Primers', showDelay: 500}"
        >
            <template #chooseicon>
                <i class="pi pi-upload"></i>
            </template>
            <template #uploadicon>
                <i class="pi pi-upload"></i>
            </template>
        </FileUpload>
    </Dialog>
</template>
