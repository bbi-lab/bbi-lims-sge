<script setup lang="ts">
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'
import type { FieldDefinitions } from '~/components/QuickForm.vue'
import PhGridNineFill from '~icons/ph/grid-nine-fill'

const showExperimentValuesForm = ref(false)
const experiment = ref<{ name: string; pcrType: string; pcr2ExperimentMasterMixVolumes?: any; plate?: any }>({})
const sampleStats = ref<Record<string, { sampleName: string; numberOfWells: number; numberOfWellsAdjustment: number, quant: number | null; pelletId: string | null }>>({})

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const calcs = ref<{
    sampleId: string;
    sampleName: string;
    quant: number | null;
    numberOfWells: number;
    numberOfWellsAdjustment: number;
    twoXKapaHifiReadyMix: string;
    tenUmForwardPrimer: string;
    tenUmReversePrimer: string;
    tenXSybrGreen: string;
    dnaAmount: string;
    water: string;
    total: string }[]>([])

const withClause = {
    pcrExperimentTargets: {
        with: {
            transfectTarget: {
                with: {
                    target: {
                        columns: {
                            name: true
                        },
                    },
                    experiment: {
                        columns: {},
                        with: {
                            cycle: {
                                columns: {
                                    name: true
                                }
                            }
                        }
                    }
                },
            }
        }
    },
    pcr2ExperimentMasterMixVolumes: {
        columns: {
            id: true,
            twoXKapaHifiReadyMix: true,
            tenUmForwardPrimer: true,
            tenUmReversePrimer: true,
            tenXSybrGreen: true,
            dnaAmount: true,
            total: true,
        }
    },
    plate: {
        with: {
            wells: {
                with: {
                    wellContents: {
                        with: {
                            wellable: {
                                with: {
                                    dna: {
                                        with: {
                                            pellet: true
                                        },
                                    },
                                    rna: {
                                        with: {
                                            pellet: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
onMounted(async() => {
    await refreshExperiment()
})

const refreshExperiment = async () => {
    experiment.value = await RecordService.getRecord(`${config.public.apiBase}/pcr-experiments`, route.params.id as string, withClause)

    // calculate well contents per sample, keyed by sample id, value is an array of objects with the following shape:
    // {
    //     sampleName: string,
    //     numberOfWells: number,
    //     quant: number | null,
    //     pelletId: string | null,
    // }
    if (_.has(experiment.value, 'plate.wells')) {
        const wells = _.get(experiment.value, 'plate.wells')
        sampleStats.value = _.reduce(wells || [], (result, well: any) => {
            _.forEach(well.wellContents, (wellContent) => {
                const sample = wellContent.wellable
                if (sample?.id && (sample.dna?.pellet || sample.rna?.pellet)) {
                    if (!_.has(result, sample.id)) {
                        _.set(result, sample.id, {
                            sampleName: sample.dna?.pellet?.name || sample.rna?.pellet?.name || 'Unknown Sample',
                            numberOfWells: 0,
                            quant: experiment.value.pcrType == 'dna-preseq-1' ? sample.dna?.concentration : experiment.value.pcrType == 'rna-preseq-1' ? sample.rna?.concentration : null,
                            pelletId: sample.dna?.pellet?.id || sample.rna?.pellet?.id || null,
                        })
                    }
                    _.set(result, `${sample.id}.numberOfWells`, _.get(result, `${sample.id}.numberOfWells`, 0) + 1)
                }
            })
            return result
        }, {})
    }

    calcs.value = _.map(sampleStats.value, (value, key) => {
        const quant = experiment.value.pcrType == 'dna-preseq-1' ? _.get(value, 'quant', null) : null
        const numberOfWells = _.get(value, 'numberOfWells', 0)
        const numberOfWellsAdjustment = _.get(value, 'numberOfWells', 0) > 0 ? 0.5 : 0
        const totalVol = _.get(experiment.value, 'pcr2ExperimentMasterMixVolumes.total', 0) * (numberOfWells + numberOfWellsAdjustment)
        const twoXKapaHifiReadyMix = _.get(experiment.value, 'pcr2ExperimentMasterMixVolumes.twoXKapaHifiReadyMix', 0) * (numberOfWells + numberOfWellsAdjustment)
        const tenUmForwardPrimer = _.get(experiment.value, 'pcr2ExperimentMasterMixVolumes.tenUmForwardPrimer', 0) * (numberOfWells + numberOfWellsAdjustment)
        const tenUmReversePrimer = _.get(experiment.value, 'pcr2ExperimentMasterMixVolumes.tenUmReversePrimer', 0) * (numberOfWells + numberOfWellsAdjustment)
        const tenXSybrGreen = _.get(experiment.value, 'pcr2ExperimentMasterMixVolumes.tenXSybrGreen', 0) * (numberOfWells + numberOfWellsAdjustment)
        const dnaAmount = dnaVolume.value ? dnaVolume.value * (numberOfWells + numberOfWellsAdjustment) : null

        return {
            sampleId: key,
            sampleName: _.get(value, 'sampleName', '??'),
            quant,
            numberOfWells,
            numberOfWellsAdjustment,
            twoXKapaHifiReadyMix: _.round(twoXKapaHifiReadyMix, 1).toFixed(1),
            tenUmForwardPrimer: _.round(tenUmForwardPrimer, 1).toFixed(1),
            tenUmReversePrimer: _.round(tenUmReversePrimer, 1).toFixed(1),
            tenXSybrGreen: _.round(tenXSybrGreen, 1).toFixed(1),
            dnaAmount: dnaAmount ? _.round(dnaAmount, 1).toFixed(1) : '-',
            water: dnaAmount ? _.round(totalVol - (twoXKapaHifiReadyMix + tenUmForwardPrimer + tenUmReversePrimer + tenXSybrGreen + dnaAmount), 1).toFixed(1) : '-',
            total: _.round(totalVol, 1).toFixed(1),
        }
    })

    showExperimentValuesForm.value = false
}

const fieldDefs: FieldDefinitions = {
    pcrExperimentId: {
        display: false,
    },
    twoXKapaHifiReadyMix: {
        label: '2X Kapa Hifi Ready Mix (μL)',
        type: 'number',
    },
    tenUmForwardPrimer: {
        label: '10uM Forward Primer (μL)',
        type: 'number',
    },
    tenUmReversePrimer: {
        label: '10uM Reverse Primer (μL)',
        type: 'number',
    },
    tenXSybrGreen: {
        label: '10X Sybr Green (μL)',
        type: 'number',
    },
    total: {
        label: 'Total Volume (μL)',
        type: 'number',
    },
}

const orderedCalcs = computed(() => _.orderBy(calcs.value, ['sampleName'], ['asc']))

const dnaVolume = computed(() => {
    return experiment.value.pcrType === 'rna-preseq-2' ? 2.5 : experiment.value.pcrType === 'dna-preseq-2' ? 2.0 : null
})
</script>
<template>
    <h3 class="p-5">
        {{ experiment.name }}
    </h3>
    <hr/>

    <div class="flex flex-row gap-4 m-5 space-x-4">
        <div>
            <span>
                <span class="text-xl font-bold mr-5">Master Mix Volumes</span>
                <Button
                    class="p-button-sm"
                    icon="pi pi-pencil"
                    v-tooltip="'Edit'"
                    @click="showExperimentValuesForm = true"
                />
            </span>
            <table class="mt-3 w-full text-sm border-collapse bg-surface-0 dark:bg-surface-900">
                <thead>
                    <tr class="text-left border-b border-surface-200 dark:border-surface-600">
                        <th class="px-4 py-4 font-semibold">Component</th>
                        <th class="px-4 py-4 font-semibold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-surface-200 dark:border-surface-600">
                        <td class="px-4 py-4">2X Kapa Hifi Ready Mix</td>
                        <td class="px-4 py-4">{{ experiment?.pcr2ExperimentMasterMixVolumes?.twoXKapaHifiReadyMix }} μL</td>
                    </tr>
                    <tr class="border-b border-surface-200 dark:border-surface-600">
                        <td class="px-4 py-4">10uM Forward Primer</td>
                        <td class="px-4 py-4">{{ experiment?.pcr2ExperimentMasterMixVolumes?.tenUmForwardPrimer }} μL</td>
                    </tr>
                    <tr class="border-b border-surface-200 dark:border-surface-600">
                        <td class="px-4 py-4">10uM Reverse Primer</td>
                        <td class="px-4 py-4">{{ experiment?.pcr2ExperimentMasterMixVolumes?.tenUmReversePrimer }} μL</td>
                    </tr>
                    <tr class="border-b border-surface-200 dark:border-surface-600">
                        <td class="px-4 py-4">10X Sybr Green</td>
                        <td class="px-4 py-4">{{ experiment?.pcr2ExperimentMasterMixVolumes?.tenXSybrGreen }} μL</td>
                    </tr>
                    <tr class="border-b border-surface-200 dark:border-surface-600">
                        <td class="px-4 py-4">{{ experiment?.pcrType === 'rna-preseq-2' ? 'cDNA Volume' : 'DNA Volume' }}</td>
                        <td class="px-4 py-4">{{ dnaVolume || '-' }} μL</td>
                    </tr>
                    <tr class="border-b border-surface-200 dark:border-surface-600">
                        <td class="px-4 py-4">Total Volume</td>
                        <td class="px-4 py-4">{{ experiment?.pcr2ExperimentMasterMixVolumes?.total }} μL</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div>
            <span>
                <span class="text-xl font-bold mr-5">Samples</span>
                <Button
                    class="p-button-sm"
                    icon="pi pi-pencil"
                    severity="info"
                    v-tooltip="'Plate Layout'"
                    @click="router.push(`/sge/plate-layout/${experiment.plate.plateType}/${experiment.plate.id}`)"
                >
                    <template #icon>
                        <PhGridNineFill />
                    </template>
                </Button>
            </span>
            <div>
                <DataTable :value="_.map(sampleStats, (value, key) => ({ ...value, sampleId: key }))" class="mt-3 text-sm">
                    <Column field="sampleName" header="Sample Name"></Column>
                    <Column field="numberOfWells" header="Number of Wells"></Column>
                    <Column v-if="experiment.pcrType === 'dna-preseq-1'" field="quant" header="Quant (ng/μL)">
                        <template #body="slotProps">
                            {{ slotProps.data.quant || '-'}}
                            <Button
                                class="p-button-sm"
                                icon="pi pi-pencil"
                                severity="info"
                                text
                                @click="router.push(`/sge/pellets?id=${slotProps.data.pelletId}`)"
                            />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
    <!-- <DataTable :value="calcs" tableStyle="min-width: 50rem">
        <Column v-for="col of calcColumns" :key="col.field" :field="col.field" :header="col.header"></Column>
    </DataTable> -->

    <!-- Calcs Grid -->
    <div class="m-5 text-xl font-bold mb-5">Calculated volumes</div>
    <div v-if="calcs.length" class="m-5 overflow-x-auto">
        <div
            class="calcs-grid mb-5 border bg-surface-0 dark:bg-surface-900 border-surface-200 dark:border-surface-600 rounded text-sm grid"
            :style="`width: max-content; grid-template-columns: minmax(180px, max-content) repeat(${orderedCalcs.length}, minmax(120px, max-content))`"
        >
            <!-- Sample name row -->
            <div class="font-semibold">Sample</div>
            <div v-for="calc in orderedCalcs" class="font-semibold">{{ calc.sampleName }}</div>
            <!-- Number of wells row -->
            <div  class="font-semibold">Number of Wells (+0.5)</div>
            <div v-for="calc in orderedCalcs">{{ calc.numberOfWells + calc.numberOfWellsAdjustment }}</div>
            <!-- 2X Kapa row -->
            <div class="font-semibold border-t-2">2X Kapa Hifi Ready Mix (μL)</div>
            <div v-for="calc in orderedCalcs" class="border-t-2">{{ calc.twoXKapaHifiReadyMix }}</div>
            <!-- Forward primer row -->
            <div class="font-semibold">10uM Forward Primer (μL)</div>
            <div v-for="calc in orderedCalcs">{{ calc.tenUmForwardPrimer }}</div>
            <!-- Reverse primer row -->
            <div class="font-semibold">10uM Reverse Primer (μL)</div>
            <div v-for="calc in orderedCalcs">{{ calc.tenUmReversePrimer }}</div>
            <!-- 10X Sybr Green row -->
            <div class="font-semibold">10X Sybr Green (μL)</div>
            <div v-for="calc in orderedCalcs">{{ calc.tenXSybrGreen }}</div>
            <!-- DNA amount row -->
            <div class="font-semibold">{{ experiment.pcrType == 'rna-preseq-1' ? 'cDNA' : 'DNA' }} (μL)</div>
            <div v-for="calc in orderedCalcs">{{ calc.dnaAmount }}</div>
            <!-- Water row -->
            <div class="font-semibold">Water (μL)</div>
            <div v-for="calc in orderedCalcs">{{ calc.water }}</div>
            <!-- Total row -->
            <div class="font-semibold border-t-2">Total (μL)</div>
            <div v-for="calc in orderedCalcs" class="font-semibold border-t-2">{{ calc.total }}</div>
        </div>
    </div>

    <Dialog
        :visible="showExperimentValuesForm"
        :modal="true"
        :closable="false"
        :style="{width: '350px'}"
        >
        <QuickForm
            tableName="pcr-2-experiment-master-mix-volumes"
            schemaName="update"
            :fieldDefs="fieldDefs"
            :recordId="experiment?.pcr2ExperimentMasterMixVolumes?.id"
            @cancel="showExperimentValuesForm = false"
            @recordUpdate="refreshExperiment"
        />
</Dialog>
</template>
<style scoped>
    .calcs-grid > div {
        @apply px-4 py-2 border-b border-l border-surface-200 dark:border-surface-600;
        overflow: hidden;
        min-width: 0;
    }
</style>
