<script setup lang="ts">
import _ from 'lodash'
import { RecordService } from '~/utils/service/RecordService'

const nucleicAcidsToAdd = ref<any[]>([])
const extractionExperiment = ref()
const pelletsTable = ref()

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()

onMounted(async() => {
    const extractionExperimentId = route.params.id as string
    extractionExperiment.value = await RecordService.getRecord(`${config.public.apiBase}/extraction-experiments`, extractionExperimentId)
})

const submitNucleicAcids = () => {
    // console.log(nucleicAcidsToAdd.value)
}
const addPelletsToExperiment = () => {
    const pelletsSkipped: any[] = []
    const pelletsToAdd: any[] = []
    _.forEach(pelletsTable?.value?.selectedRecords || [], (pellet) => {
        if (!_.includes(_.map(nucleicAcidsToAdd.value || [], (x) => x.id), pellet.id)) {
            pelletsToAdd.push(pellet)
        } else {
            pelletsSkipped.push(pellet)
        }
    })

    nucleicAcidsToAdd.value.push(...pelletsToAdd)
    if (pelletsToAdd.length) {
        toast.add({
            severity: 'success',
            summary: 'Pellets added',
            detail: `${_.size(pelletsToAdd)} pellets added to the extraction experiment`,
            life: 3000,
        })
    }
    if (pelletsSkipped.length) {
        toast.add({
            severity: 'warn',
            summary: 'Pellets skipped',
            detail: `${_.size(pelletsSkipped)} pellets already in the extraction experiment`,
            life: 3000,
        })
    }
}

const displayWithClause = Object.freeze({
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
})
const columnDefs = {
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
    storageBoxId: {display: false},
    storageBoxLoc: {display: false},
    d3Confluency: {display: false},
    dnaConcentration: {display: false},
    dnaVolume: {display: false},
    dnaYield: {display: false},
    rnaConcentration: {display: false},
    rnaVolume: {display: false},
    rnaYield: {display: false},
}
</script>
<template>
    <div class="flex flex-col h-full overflow-y-hidden">
        <div class="flex flex-row w-full p-5">
            <h4 class="flex-none">Extraction experiment: {{ extractionExperiment?.name }} </h4>
            <div class="flex-grow"></div>
            <Button
                size="large"
                icon="pi pi-arrow-right"
                iconPos="right"
                severity="info"
                class="flex-none"
                label="Add selected pellets"
                :disabled="!pelletsTable?.selectedRecords?.length"
                @click="addPelletsToExperiment" />
            <div class="flex-grow"></div>
            <Button
                size="large"
                icon="pi pi-bolt"
                severity="warn"
                class="flex-none"
                :label="`Extract DNA`"
                :disabled="!nucleicAcidsToAdd.length"
                @click="submitNucleicAcids" />
        </div>
        <Splitter class="h-full overflow-y-hidden">
            <SplitterPanel :size="60">
                <QuickTable
                    ref="pelletsTable"
                    tableName="pellets"
                    title="Pellets"
                    schemaName="select"
                    :columnDefs="columnDefs"
                    :withClause="displayWithClause"
                    :canAdd="false"
                    :canDelete="false"
                    :canEdit="false"
                    :canExport="false"
                />
            </SplitterPanel>
            <SplitterPanel :size="40" :minSize="25">
                <DataTable
                    :value="nucleicAcidsToAdd"
                    dataKey="id"
                    tableStyle="min-width: 50rem"
                    :scrollable="true"
                    scrollHeight="flex">
                    <template #header>
                        <span class="text-xl font-bold">Pellets to process</span>
                    </template>
                    <template #empty> No data </template>
                    <Column field="transfectTarget.target.name" header="target"></Column>
                    <Column field="replicates" header="Replicates">
                        <template #body="slotProps">
                            {{ _.join(slotProps.data.replicates, ', ') }}
                        </template>
                    </Column>
                </DataTable>
            </SplitterPanel>
        </Splitter>
    </div>
</template>
