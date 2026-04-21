<script setup lang="ts">
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import { wellCoordinateToChar } from '~/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'

const config = useRuntimeConfig()
const crudTable = useCrudTable()
const toast = useToast()
const importDialogVisible = ref(false)

const submitHaPuc19Primers = async (data: any[]) => {
    try {
        const filteredData = _.filter(data, (item) => {
            return !_.includes(_.toLower(item.notes || ''), 'sample row')
        })
        if (_.isEmpty(filteredData)) {
            toast.add({ severity: 'warn', summary: 'No records found', life: 5000 })
            return
        }
        const response: { primers: { id: string }[]; insertedCount: number } = await $fetch(`${config.public.apiBase}/custom/primers/ha-puc19-primers/import`, {
            method: 'POST',
            body: filteredData,
        })
        crudTable.didAddRecords(response.primers)
        toast.add({ severity: 'success', summary: 'Success', detail: `Successfully imported ${response.insertedCount} Homology Arm PUC 19 Primers.`, life: 5000 })
        importDialogVisible.value = false
    } catch (error: any) {
        const userMessage = _.isArray(error?.data?.data) ? convertErrorDataToUserMessage(error.data.data) : error.statusMessage ?? 'An unexpected error occurred during import. Please try again.'
        toast.add({ severity: 'error', summary: 'Error', detail: userMessage, life: 5000 })
    }
}

const importHaPuc19Primers = (event: any) => {
    try {
        fileToSheet(event.files[0], submitHaPuc19Primers)
    } catch (error) {
        console.error('Error importing Homology Arm PUC 19 Primers:', error)
    }
}

const withClause = Object.freeze({
    homologyArmPrimer: {
        with: {
            targets: {
                with: {
                    target: {
                        columns: {
                            id: true,
                            name: true,
                        }
                    },
                },
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

const columnDefs: ColumnDefinitions = {
    name: {
        index: 1
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            return combinedWellLocations(x) as string
        },
        path: 'wellContents.displayValue',
        type: 'string',
        index: 4,
    },
    homologyArmPrimerId: { display: false },
    homologyArmPrimer: {
        path: 'homologyArmPrimer.name',
        index: 2,
    },
    sequence: {
        index: 3,
    },
}

const fieldDefs: FieldDefinitions = {
    homologyArmPrimerId: {
        label: 'Homology Arm Primer',
        subtext: (_data, relatedData) => {
            const haPrimerSequence = _.has(relatedData, 'homologyArmPrimerId') ? _.get(relatedData, 'homologyArmPrimerId.sequence') : _.get(_data, 'homologyArmPrimer.sequence')
            return `Sequence: ${haPrimerSequence || ''}`
        },
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/homology-arm-primers`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
        },
        events: {
            change: async (record: any, recordOld: any) => {
                // auto-calculate name if homologyArmPrimerId changes
                if (record?.homologyArmPrimerId != recordOld?.homologyArmPrimerId) {
                    if (!record?.homologyArmPrimerId) {
                        record.name = ''
                        record.sequence = ''
                    } else {
                        const haPrimer = await RecordService.getRecord(`${config.public.apiBase}/homology-arm-primers`, record.homologyArmPrimerId as string, {})
                        record.name = _.replace(_.replace(haPrimer.name, /_F$/gi , '_pUC19_F'), /_R$/gi , '_pUC19_R')
                        if (haPrimer.sequenceType == 'forward') {
                            record.sequence = `GTTTTCCCAGTCACGACGTTGTAAAACGACGGCCAGT${haPrimer.sequence}`
                        } else if (haPrimer.sequenceType == 'reverse') {
                            record.sequence = `GATTACGCCAAGCTTGCATGCCTGCAGGT${haPrimer.sequence}`
                        }
                    }
                }
            },
        },
        index: 0,
    },
    name: {
        index: 2,
    },
}
</script>
<template>
    <Splitter class="h-full overflow-y-hidden">
        <SplitterPanel :size="50">
            <QuickTable
                :ref="crudTable.setTableRef"
                tableName="homology-arm-puc-19-primers"
                schemaName="select"
                title="Homology Arm PUC 19 Primers"
                :with-clause="withClause"
                :column-defs="columnDefs"
                @clickedRecordEdit="crudTable.didClickRecordEdit"
                @clickedRecordAdd="crudTable.didClickRecordAdd"
            >
                <template #header-buttons>
                    <Button
                        v-if="!crudTable.state.showAddForm && !crudTable.state.showEditForm"
                        label="Import"
                        icon="pi pi-file-import"
                        @click="importDialogVisible = true"
                    />
                </template>
            </QuickTable>
        </SplitterPanel>
         <SplitterPanel v-if="crudTable.state.showAddForm || crudTable.state.showEditForm">
            <QuickForm
                v-if="crudTable.state.showAddForm"
                tableName="homology-arm-puc-19-primers"
                schemaName="insert"
                :fieldDefs="fieldDefs"
                @cancel="crudTable.didClickCancelAddForm"
                @recordAdd="crudTable.didAddRecord"
            />
            <QuickForm
                v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                :recordId="crudTable.state.editingRecordId"
                tableName="homology-arm-puc-19-primers"
                schemaName="update"
                :fieldDefs="fieldDefs"
                :withClause="{homologyArmPrimer: true}"
                @cancel="crudTable.didClickCancelEditForm"
                @recordUpdate="crudTable.didUpdateRecord"
                @recordDelete="crudTable.didDeleteRecord"
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
            <span class="flex justify-center mt-3 font-bold">Import Homology Arm PUC 19 Primers</span>
        </slot>
        <p class="text-sm text-center mt-3 mb-5 text-surface-500">
            Expected columns: HA Primer Name, Name (optional), Sequence (optional), Ordered On, Notes, Plate Storage Box Name, Well Tube Coordinates
        </p>
        <div class="flex justify-center">
            <FileUpload
                mode="basic"
                accept="application/msexcel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                class="p-button-info"
                :maxFileSize="1000000"
                :customUpload="true"
                :auto="true"
                @uploader="importHaPuc19Primers"
                chooseLabel="Upload"
            >
                <template #chooseicon>
                    <i class="pi pi-upload"></i>
                </template>
            </FileUpload>
        </div>
    </Dialog>
</template>
