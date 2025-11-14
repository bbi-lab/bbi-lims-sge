<script setup lang="ts">
import _ from 'lodash'
import { RecordService } from '~/utils/service/RecordService'
import { type NucleicAcid } from '~/server/db/schema/sge/nucleic-acid'
import type { FieldDefinitions } from '~/components/QuickForm.vue'

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()
const pelletsCrudTable = useCrudTable()
const nucleicAcidsCrudTable = useCrudTable()
const showPelletsFromAllDays = ref(false)

const pelletsWhereClause = computed(() => {
    return showPelletsFromAllDays.value ? {'==':[{'var': 'nucleicAcid'}, null]} :
    {
        'and':[
            {'==':[{'var': 'nucleicAcid'}, null]},
            {'in':[{'var': 'harvestDay'}, [5, 13]]},
        ]
    }
})
const extractionExperiment = ref()
const showNucleicAcidEditDialog = computed(() => {
    return nucleicAcidsCrudTable.state.showEditForm || nucleicAcidsCrudTable.state.showMultipleEditForm
})

onMounted(async() => {
    const extractionExperimentId = route.params.id as string
    extractionExperiment.value = await RecordService.getRecord(`${config.public.apiBase}/extraction-experiments`, extractionExperimentId, {})
})

const extractFromSelectedPellets = async () => {
    const nucleicAcidsToAdd = _.map(pelletsCrudTable.tableRef.value.selectedRecords, (pellet) => {
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
            // add nucleic acids to nucleic acids table and remove from pellets table
            nucleicAcidsCrudTable.tableRef.value.addOrRefreshRecordIds(_.map(nucleicAcidsAdded, 'id'))
            _.forEach(nucleicAcidsAdded, (x) => {
                pelletsCrudTable.tableRef.value.removeRecordId(x.pelletId)
            })
            pelletsCrudTable.tableRef.value.selectedRecords = []
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
            detail: e.data?.statusMessage || 'Unknown error',
            life: 3000,
        })
    }
}

const didDeleteMultipleNucleicAcids = (event: any[]) => {
    pelletsCrudTable.tableRef.value.addOrRefreshRecordIds(_.map(event, 'pelletId'))
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
const nucleicAcidFieldDefs: FieldDefinitions = {
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
                    :ref="pelletsCrudTable.setTableRef"
                    tableName="pellets"
                    title="Pellets"
                    schemaName="select"
                    :columnDefs="pelletsColumnDefs"
                    :withClause="pelletsWithClause"
                    :where="pelletsWhereClause"
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
                            :disabled="_.isEmpty(pelletsCrudTable.tableRef.value?.selectedRecords)"
                            @click="extractFromSelectedPellets" />
                            <span class="flex items-center space-x-2">
                                <ToggleSwitch id="showPelletsFromAllDaysToggle" v-model="showPelletsFromAllDays" />
                                <label for="showPelletsFromAllDaysToggle">
                                    All days
                                </label>
                            </span>
                    </template>
                </QuickTable>
            </SplitterPanel>
            <SplitterPanel :size="50" :minSize="25">
                <QuickTable
                    :ref="nucleicAcidsCrudTable.setTableRef"
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
                    @clickedRecordEdit="nucleicAcidsCrudTable.didClickRecordEdit"
                    @clickedMultipleRecordEdit="nucleicAcidsCrudTable.didClickMultipleRecordEdit"
                    @didDeleteMultipleRecords="didDeleteMultipleNucleicAcids"
                />
            </SplitterPanel>
        </Splitter>
        <Dialog v-model:visible="showNucleicAcidEditDialog" modal header="Edit" :style="{ width: 'auto' }" :closable="false">
            <QuickForm
                v-if="nucleicAcidsCrudTable.state.editingRecordId && nucleicAcidsCrudTable.state.showEditForm"
                :recordId="nucleicAcidsCrudTable.state.editingRecordId"
                tableName="nucleic-acids"
                schemaName="update"
                :fieldDefs="nucleicAcidFieldDefs"
                @cancel="nucleicAcidsCrudTable.didClickCancelEditForm"
                @recordUpdate="nucleicAcidsCrudTable.didUpdateRecord"
                @recordDelete="nucleicAcidsCrudTable.didDeleteRecord"
            />
            <QuickFormMultiple
                v-if="nucleicAcidsCrudTable.state.showMultipleEditForm"
                tableName="nucleic-acids"
                :recordIds="nucleicAcidsCrudTable.state.editingMultipleRecordsIds"
                schemaName="update"
                :fieldDefs="nucleicAcidFieldDefs"
                @cancel="nucleicAcidsCrudTable.didClickCancelMultipleEditForm"
                @records-update="nucleicAcidsCrudTable.didUpdateMultipleRecords"
            />
        </Dialog>
    </div>
</template>
