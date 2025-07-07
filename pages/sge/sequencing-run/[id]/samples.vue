<script setup lang="ts">
import { wellCoordinateToChar } from '~/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import _ from 'lodash'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const route = useRoute()
const config = useRuntimeConfig()
const sequencingRun = ref()
const showPlatePanel = ref(false)
const breakpoints = useBreakpoints(breakpointsTailwind)
const smallerThanLg = breakpoints.smaller('lg')
const selectedPlateId = ref()
const plateLayout = usePlateLayout()
const plateWithWellSpecs = ref()
const plateDiagramKey = ref(0)
const toast = useToast()
const sequencingRunSamplesTable = ref()

const frozenRecordIds = computed(() => {
    const selectedWellIds = _.map(plateLayout.selectedWells.value, 'id')
    return _.map(_.filter(sequencingRunSamplesTable.value?.records , (x) => {
        return _.includes(selectedWellIds, x.sourceWellId)
    }), 'id')
})

const invalidRecords = computed(() => {
    const nucleicAcidIdCounts = _.countBy(sequencingRunSamplesTable.value?.records || [], 'nucleicAcidId')
    const recordsWithRepeatedNucleicAcids = _.filter(sequencingRunSamplesTable.value?.records || [], (record) => {
        return _.get(nucleicAcidIdCounts, record.nucleicAcidId) > 1
    }).map((record) => ({id: record.id, count: nucleicAcidIdCounts[record.nucleicAcidId]}))

    return _.mapValues(_.keyBy(recordsWithRepeatedNucleicAcids, 'id'), (val, id) => {
        return {messages: [`Repeated ${val?.count} times.`]}
    })
})

watch (selectedPlateId, async (newValue) => {
    if (newValue) {
        plateLayout.setPlateId(newValue)
        plateLayout.wellContentsDisplayConfig.value = {
            colorBy: [() => true],
            tooltip: (well: any) => {
                const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
                const wellContentsText = _.map(well.wellContents, (wellContent) => {
                    const nucleicAcid = wellContent.nucleicAcid
                    if (nucleicAcid) {
                        return nucleicAcid.pellet ? `${nucleicAcid.pellet.name} (DNA)` : '?? (DNA)'
                    } else if (wellContent.indexPrimer) {
                        return `${wellContent.indexPrimer.indexSequence} (${wellContent.indexPrimer.primerType} INDEX)`
                    } else {
                        return ''
                    }
                }).join('<br>')
                return wellContentsText ? `${wellCoordinate}:<br>${wellContentsText}` : wellCoordinate
            },
            symbol: (well: any) => {
                return _.size(well.wellContents) || ''
            },
        }
        await plateLayout.loadPlate({
            nucleicAcid: {
                with: {
                    pellet: true
                }
            },
            indexPrimer: true,
            wellContentSources: {
                with: {
                    sourceWell: {
                        columns: {},
                        with: {
                            plate: {
                                columns: {
                                    id: true,
                                }
                            }
                        }
                    },
                },
            },
        })
        plateWithWellSpecs.value = {
            ...plateLayout.plateWithWellContents.value,
            wells: _.values(plateLayout.wellSpecs.value),
        }
        plateDiagramKey.value += 1
    }
})

onMounted(async () => {
    sequencingRun.value = await RecordService.getRecord(`${config.public.apiBase}/sequencing-runs`, route.params.id as string, {})
})

const addToSequencingRun = async (selectedWells: any) => {
    try {
        const sequencingRunSamplesToAdd = _.compact(_.map(selectedWells, ({data}) => {
            if (_.isEmpty(data.wellContents)) return null

            const indexPrimerContentsP7 = _.filter(data.wellContents, (x) => x.indexPrimer?.primerType == 'P7')
            const indexPrimerContentsP5 = _.filter(data.wellContents, (x) => x.indexPrimer?.primerType == 'P5')
            const nucleicAcidWellContents = _.filter(data.wellContents, (x) => x.nucleicAcidId)
            if (indexPrimerContentsP7.length == 1 && indexPrimerContentsP5.length == 1 && nucleicAcidWellContents.length == 1) {
                return {
                    sequencingRunId: sequencingRun.value.id,
                    nucleicAcidId: nucleicAcidWellContents[0].nucleicAcidId,
                    indexPrimer1Id: indexPrimerContentsP7[0].indexPrimerId,
                    indexPrimer2Id: indexPrimerContentsP5[0].indexPrimerId,
                    sourceWellId: data.id,
                }
            } else {
                throw new Error('Invalid well contents: selected wells must contain exactly one P5 index primer, one P7 index primer, and one nucleic acid.')
            }
        }))
        if (sequencingRunSamplesToAdd.length > 0) {
            const newRecords = await RecordService.addRecords(`${config.public.apiBase}/custom/sequencing-run/${route.params.id}/sequencing-run-samples`, sequencingRunSamplesToAdd) as any[]
            if (!_.isEmpty(newRecords)) {
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `${sequencingRunSamplesToAdd.length} samples added to sequencing run.`,
                    life: 3000,
                })
                _.forEach(newRecords, (record) => {
                    sequencingRunSamplesTable.value.addOrRefreshRecordId(record.id)
                })
            }
        }
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.statusMessage || error.message,
            life: 10000,
        })
    }
}

const displayWithClause = {
    nucleicAcid: {
        columns: {id: true},
        with: {
            pellet: {
                name: true,
            },
        },
    },
    indexPrimer1: {
        columns: {id: true, name: true, indexSequence: true, primerType: true},
    },
    indexPrimer2: {
        columns: {id: true, name: true, indexSequence: true, primerType: true},
    },
    sourceWell: {
        columns: {id: true, x: true, y: true},
        with: {
            plate: {
                columns: {id: true, name: true, plateType: true},
            },
        },
    },
}
const columnDefs = {
    sequencingRunId: { display: false},
    createdAt: { display: false },
    nucleicAcidId: { display: false },
    indexPrimer1Id: { display: false },
    indexPrimer2Id: { display: false },
    sourceWellId: { display: false },
    nucleicAcid: {
        path: 'nucleicAcid.pellet.name',
    },
    indexPrimer1: {
        format: (data: any) => {
            return data.indexPrimer1 ? `${data.indexPrimer1.indexSequence} (${data.indexPrimer1.primerType})` : ''
        },
        path: 'indexPrimer1.displayValue',
    },
    indexPrimer2: {
        format: (data: any) => {
            return data.indexPrimer2 ? `${data.indexPrimer2.indexSequence} (${data.indexPrimer2.primerType})` : ''
        },
        path: 'indexPrimer2.displayValue',
    },
    sourceWell: {
        format: (data: any) => {
            return data.sourceWell ? `${data.sourceWell.plate.name}: ${wellCoordinateToChar(data.sourceWell.y)}${data.sourceWell.x}` : ''
        },
        path: 'sourceWell.displayValue',
    },
}
</script>
<template>
    <Splitter class="h-full mb-8" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
        <SplitterPanel :size="smallerThanLg ? 100 : 50">
            <QuickTable
                ref="sequencingRunSamplesTable"
                v-if="sequencingRun"
                tableName="sequencing-run-samples"
                schemaName="select"
                :withClause="displayWithClause"
                :canAdd="false"
                :canEdit="false"
                :canDelete="true"
                :columnDefs="columnDefs"
                :invalidRecords="invalidRecords"
                :where="{'==': [{'var': 'sequencingRunId'}, sequencingRun.id]}"
                v-model:frozenRecordIds="frozenRecordIds"
            >
                <template #title>
                    <span class="text-2xl font-bold m-0">{{ sequencingRun.name }} samples</span>
                </template>
                <template #header-buttons>
                    <Button
                        v-if="sequencingRun"
                        label="Add from plate"
                        class="btn btn-primary"
                        @click="showPlatePanel=true" />
                </template>
            </QuickTable>
        </SplitterPanel>

        <SplitterPanel v-if="showPlatePanel">
            <div class="flex justify-end m-2">
                <Button
                    icon="pi pi-times"
                    severity="secondary"
                    size="small"
                    @click="showPlatePanel=false" />
            </div>
            <div class="overflow-scroll h-full">
                <div class="flex justify-center m-2">
                    <AutoCompleter
                        v-model="selectedPlateId"
                        :searchBaseUrl="`${config.public.apiBase}/plates`"
                        :searchWhereClause="{'==': [{'var': 'plateType'}, 'preseq-3']}"
                        iftaLabel="Plate"
                        dropdown
                        hideClearButton
                    />
                </div>
                <div class="flex justify-center m-2 pb-20">
                    <PlateDiagram
                        :key="plateDiagramKey"
                        v-if="plateWithWellSpecs"
                        :ref="plateLayout.setPlateDiagramRef"
                        v-model="plateWithWellSpecs"
                        :plateType="plateWithWellSpecs.plateType"
                        :sizeX="plateWithWellSpecs.sizeX"
                        :sizeY="plateWithWellSpecs.sizeY"
                        @well-range-selected="plateLayout.wellRangeSelected"
                        @well-selection-cleared="plateLayout.wellSelectionCleared"
                        @all-wells-selected="plateLayout.selectedAllWells"
                    >
                        <template #button1>
                            <Button
                                class="p-button-secondary"
                                icon="pi pi-plus"
                                v-tooltip="{value: 'Add to sequencing run', showDelay: 500}"
                                :disabled="_.isEmpty(plateLayout.selectedWells.value)"
                                @click="addToSequencingRun(plateLayout.selectedWells.value)" />
                        </template>
                    </PlateDiagram>
                </div>
            </div>
        </SplitterPanel>
    </Splitter>


</template>
