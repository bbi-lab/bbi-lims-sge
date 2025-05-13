<script setup lang="ts">
import _ from 'lodash'
import { RecordService } from '~/utils/service/RecordService'
import { VALID_PROTOCOLS, type NucleicAcid } from '~/server/db/schema/sge/nucleic-acid'
import type { FieldDefinitions } from '~/components/QuickForm.vue'


const extractionExperiment = ref()
const pelletsTable = ref()
const nucleicAcidsTable = ref()
const showEditForm = ref(false)
const showMultipleEditForm = ref(false)
const showNucleicAcidEditDialog = computed(() => {
    return showEditForm.value || showMultipleEditForm.value
})
const editingRecordId = ref<string | undefined>()
const editingMultipleRecordsIds = ref<string[]>([])

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()

onMounted(async() => {
    const extractionExperimentId = route.params.id as string
    extractionExperiment.value = await RecordService.getRecord(`${config.public.apiBase}/extraction-experiments`, extractionExperimentId, {})
})

const extractFromSelectedPellets = async () => {
    const nucleicAcidsToAdd = _.map(pelletsTable.value.selectedRecords, (pellet) => {
        return {
            pelletId: pellet.id,
            extractionExperimentId: route.params.id,
        }
    })
    try {
        const nucleicAcidsAdded = await RecordService.addRecords(`${config.public.apiBase}/nucleic-acids`, nucleicAcidsToAdd) as NucleicAcid[]
        if (!_.isEmpty(nucleicAcidsAdded)) {
            toast.add({
                severity: 'success',
                summary: 'Nucleic acids added',
                detail: `${_.size(nucleicAcidsAdded)} nucleic acids added`,
                life: 3000,
            })
            _.forEach(nucleicAcidsAdded, (x) => {
                nucleicAcidsTable.value.addOrRefreshRecordId(x.id)
                pelletsTable.value.removeRecordId(x.pelletId)
            })
            pelletsTable.value.selectedRecords = []
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error adding nucleic acids',
                detail: `Failed to add nucleic acids`,
                life: 3000,
            })
        }
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Error adding nucleic acids',
            detail: e.statusMessage || 'Unknown error',
            life: 3000,
        })
    }
}

const didClickRecordEdit = (event: any) => {
    editingRecordId.value = event.id
    showEditForm.value = true
    showMultipleEditForm.value = false
}

const didClickMultipleRecordEdit = (recordIds: string[]) => {
    editingMultipleRecordsIds.value = recordIds
    showMultipleEditForm.value = true
    showEditForm.value = false
}

const didClickCancelEditForm = () => {
    editingRecordId.value = undefined
    showEditForm.value = false
}
const didClickCancelMultipleEditForm = () => {
    editingMultipleRecordsIds.value = []
    showMultipleEditForm.value = false
}
const didUpdateRecord = (event: any) => {
    if (event.id) nucleicAcidsTable.value.addOrRefreshRecordId(event.id)
    showEditForm.value = false
}
const didUpdateMultipleRecords = (event: any[]) => {
    event.forEach(e => {
        if (e.id) nucleicAcidsTable.value.addOrRefreshRecordId(e.id)
    })
    showMultipleEditForm.value = false
}
const didDeleteRecord = (event: any) => {
    if (event.id) nucleicAcidsTable.value.removeRecordId(event.id)
    pelletsTable.value.addOrRefreshRecordId(event.pelletId)
    showEditForm.value = false
}
const didDeleteMultipleNucleicAcids = (event: any[]) => {
    event.forEach(e => {
        pelletsTable.value.addOrRefreshRecordId(e.pelletId)
    })
}
const pelletsWithClause = Object.freeze({
    transfectTarget: {
        columns: {},
        with: {
            target: {
                columns: {
                    name: true
                },
                with: {
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
                    }
                }
            },
            experiment: {
                columns: {
                    id: true,
                    name: true
                },
            }
        }
    },
    nucleicAcid: {
        columns: {
            id: true
        }
    },
})
const pelletsColumnDefs = {
    name: {
        index: 0,
    },
    transfectTarget: {
        header: 'Target',
        format: (x: any) => { return _.get(x, 'transfectTarget.target.name') || `${_.get(x, 'transfectTarget.target.region.gene.symbol')} : ${_.get(x, 'transfectTarget.target.region.name')}`},
        path: 'transfectTarget.displayValue',
        type: 'string',
        index: 1,
    },
    transfectTargetId: {display: false},
    extractionExperimentId: {display: false},
    harvestedOn: {display: false},
    harvestedBy: {display: false},
    d3Confluency: {display: false},
}

const nucleicAcidsWithClause = {
    pellet: {
        columns: {
            name: true,
        }
    }
}
const nucleicAcidsColumnDefs = {
    name: {
        path: 'pellet.name',
        index: 0,
    },
    protocol: {
        index: 1,
    },
    extractionExperimentId: {
        display: false,
    },
    pelletId: {
        display: false,
    },
    dnaConcentration: {
        header: 'DNA conc (ng/μL)',
    },
    dnaVolume: {
        header: 'DNA vol (μL)',
    },
    dnaYield: {
        header: 'DNA yield (μg)',
    },
    rnaConcentration: {
        header: 'RNA conc (ng/μL)',
    },
    rnaVolume: {
        header: 'RNA vol (μL)',
    },
    rnaYield: {
        header: 'RNA yield (μg)',
    },
}
const nucleicAcidFieldDefinitions: FieldDefinitions = {
    extractionExperimentId: {
        display: false,
    },
    pelletId: {
        label: 'Pellet',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/pellets`,
            searchFields: ['transfectTarget.experiment.name', 'transfectTarget.target.name'],
            searchWithClause: {
                transfectTarget: {columns: {}, with: {experiment: {columns: {name: true}}, target: {columns: {name: true}}}},
            },
            valueField: 'id',
            displayFields: ['transfectTarget.experiment.name', 'transfectTarget.target.name'],
        }
    },
    dnaConcentration: {
        label: 'DNA concentration (ng/μL)',
    },
    dnaVolume: {
        label: 'DNA volume (μL)',
    },
    dnaYield: {
        label: 'DNA yield (μg)',
    },
    rnaConcentration: {
        label: 'RNA concentration (ng/μL)',
    },
    rnaVolume: {
        label: 'RNA volume (μL)',
    },
    rnaYield: {
        label: 'RNA yield (μg)',
    },
}
</script>
<template>
    <div class="flex flex-col h-full overflow-y-hidden">
        <div class="flex w-full mt-5 ml-5">
            <h4>Extraction experiment: {{ extractionExperiment?.name }} </h4>
        </div>
        <Splitter class="h-full overflow-y-hidden">
            <SplitterPanel :size="50">
                <QuickTable
                    ref="pelletsTable"
                    tableName="pellets"
                    title="Pellets"
                    schemaName="select"
                    :columnDefs="pelletsColumnDefs"
                    :withClause="pelletsWithClause"
                    :where="{'==':[{'var': 'nucleicAcid'}, null]}"
                    :canAdd="false"
                    :canDelete="false"
                    :canEdit="false"
                    :canExport="false"
                    :hideSettings="true"
                >
                    <template #header-buttons>
                        <Button
                            size="large"
                            icon="pi pi-bolt"
                            iconPos="right"
                            severity="warn"
                            class="flex-none"
                            label="Extract"
                            :disabled="!pelletsTable?.selectedRecords?.length"
                            @click="extractFromSelectedPellets" />
                    </template>
                </QuickTable>
            </SplitterPanel>
            <SplitterPanel :size="50" :minSize="25">
                <QuickTable
                    ref="nucleicAcidsTable"
                    tableName="nucleic-acids"
                    title="Nucleic acids"
                    schemaName="select"
                    :where="{'==':[{'var': 'extractionExperimentId'}, route.params.id]}"
                    :withClause="nucleicAcidsWithClause"
                    :columnDefs="nucleicAcidsColumnDefs"
                    :canAdd="false"
                    :canDelete="true"
                    :canEdit="true"
                    :canEditMultiple="true"
                    :canExport="false"
                    :hideSettings="true"
                    @clickedRecordEdit="didClickRecordEdit"
                    @clickedMultipleRecordEdit="didClickMultipleRecordEdit"
                    @didDeleteMultipleRecords="didDeleteMultipleNucleicAcids"
                />
            </SplitterPanel>
        </Splitter>
        <Dialog v-model:visible="showNucleicAcidEditDialog" modal header="Edit" :style="{ width: 'auto' }" :closable="false">
            <QuickForm
                v-if="showEditForm"
                :recordId="editingRecordId"
                tableName="nucleicAcids"
                schemaName="update"
                :fieldDefs="nucleicAcidFieldDefs"
                @cancel="didClickCancelEditForm"
                @recordUpdate="didUpdateRecord"
                @recordDelete="didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="showMultipleEditForm"
                tableName="nucleic-acids"
                :recordIds="editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="nucleicAcidFieldDefs"
                @cancel="didClickCancelMultipleEditForm"
                @records-update="didUpdateMultipleRecords"
            />
        </Dialog>
    </div>
</template>
