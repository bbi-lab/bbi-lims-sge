<script setup lang="ts">
import { RecordService } from '~/utils/service/RecordService'
import _ from 'lodash'
import { ENUM_LOOKUPS } from '~/server/db/schema/sge/enum-lookups'
import { wellCoordinateToChar } from '~/lib/plate-diagram'

const config = useRuntimeConfig()
const route = useRoute()

type NucleicAcidPcrEntry = Record<string, {plateName: string, plateType: string, plateTypeLabel: string, wells: {x: number, y: number}[]}>
const pellet = ref()
const pcrEntries = ref<NucleicAcidPcrEntry>({})

onMounted (async () => {
    pellet.value = await RecordService.getRecord(
        `${config.public.apiBase}/pellets`,
        route.params.id as string,
        {
            harvestedBy: {
                columns: {
                    name: true
                },
            },
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
                        },
                        with: {
                            cycle: true,
                        },
                    }
                }
            },
            nucleicAcid: {
                with: {
                    extractionExperiment: {
                        with: {
                            technician: {
                                columns: {
                                    name: true
                                }
                            }
                        },
                    },
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
            },
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
    )

    pcrEntries.value = _.reduce(pellet.value.nucleicAcid?.wellContents || [], (acc: NucleicAcidPcrEntry, wellContent) => {
        const plateId = wellContent.well.plate.id
        if (!_.has(acc, plateId)) {
            _.set(acc, plateId, {
                plateName: wellContent.well.plate.name,
                plateType: wellContent.well.plate.plateType,
                plateTypeLabel: ENUM_LOOKUPS.plates.plateType[wellContent.well.plate.plateType].label,
                wells: [_.pick(wellContent.well, ['x', 'y'])]
            })
        } else {
            acc[plateId].wells.push(_.pick(wellContent.well, ['x', 'y']))
        }
        return acc as NucleicAcidPcrEntry
    }, {})

})
</script>
<template>
    <div class="text-xl font-bold m-4">Sample Summary</div>
    <hr class="m-2">
    <div v-if="pellet" class="flex flex-wrap m-4 gap-x-24 gap-y-12">
        <div class="space-x-4 space-y-2">
            <div class="text-lg font-bold">Pellet:</div>
            <div>
                <strong>Name:</strong> {{ pellet.name }}
            </div>
            <div>
                <strong>Transfect Target:</strong>
                {{ pellet.transfectTarget?.target?.name}}
            </div>
            <div>
                <strong>Transfections:</strong> {{ pellet.transfections.join(', ') }}
            </div>
            <div>
                <strong>Harvested On:</strong> {{ pellet.harvestedOn ? `${new Date(pellet.harvestedOn).toLocaleDateString()} (Day ${pellet.harvestDay})` : '' }}
            </div>
            <div>
                <strong>Harvested By:</strong> {{ pellet.harvestedBy?.name }}
            </div>
            <div>
                <strong>Cycle:</strong> {{ pellet.transfectTarget?.experiment?.cycle?.name }}
            </div>
            <div>
                <strong>Is backup:</strong> {{ pellet.isBackup ? 'Yes' : 'No' }}
            </div>
            <div>
                <strong>Is current:</strong> {{ pellet.isCurrent ? 'Yes' : 'No' }}
            </div>
            <div>
                <strong>Quant:</strong> {{ pellet.quant }}
            </div>
            <div>
                <strong>D3 confluencey:</strong> {{ pellet.d3Confluency }}
            </div>
            <div>
                <strong>% passaged:</strong> {{ pellet.pctPassaged }}
            </div>
            <div>
                <strong>% harvested:</strong> {{ pellet.pctHarvested }}
            </div>
            <div>
                <strong>Storage location:</strong>
            </div>
        </div>
        <div class="space-x-4 space-y-2">
            <div class="text-lg font-bold">Nucleic Acid:</div>
            <div>
                <strong>Extracted:</strong> {{ pellet.nucleicAcid.id ? 'Yes' : 'No' }}
            </div>
            <template v-if="pellet.nucleicAcid.id">
                <div>
                    <strong>Extraction Experiment:</strong> {{ pellet.nucleicAcid.extractionExperiment?.name }}
                </div>
                <div>
                    <strong>Extracted on:</strong> {{ pellet.nucleicAcid.extractionExperiment?.extractedOn ? new Date(pellet.nucleicAcid.extractionExperiment.extractedOn).toLocaleDateString() : '' }}
                </div>
                <div>
                    <strong>Extracted by:</strong> {{ pellet.nucleicAcid.extractionExperiment?.technician?.name }}
                </div>
                <div>
                    <strong>DNA concentration:</strong> {{ pellet.nucleicAcid.dnaConcentration ? `${pellet.nucleicAcid.dnaConcentration} ng/µL` : '' }}
                </div>
                <div>
                    <strong>DNA volume:</strong> {{ pellet.nucleicAcid.dnaVolume ? `${pellet.nucleicAcid.dnaVolume} µL` : '' }}
                </div>
                <div>
                    <strong>DNA yield:</strong> {{ pellet.nucleicAcid.dnaYield ? `${pellet.nucleicAcid.dnaYield} ng` : '' }}
                </div>
                <div>
                    <strong>RNA concentration:</strong> {{ pellet.nucleicAcid.rnaConcentration ? `${pellet.nucleicAcid.rnaConcentration} ng/µL` : '' }}
                </div>
                <div>
                    <strong>RNA volume:</strong> {{ pellet.nucleicAcid.rnaVolume ? `${pellet.nucleicAcid.rnaVolume} µL` : '' }}
                </div>
                <div>
                    <strong>RNA yield:</strong> {{ pellet.nucleicAcid.rnaYield ? `${pellet.nucleicAcid.rnaYield} ng` : '' }}
                </div>
                <div>
                    <strong>Protocol:</strong> {{ pellet.nucleicAcid.protocol }}
                </div>
                <div>
                    <strong>Notes:</strong> {{ pellet.nucleicAcid.notes }}
                </div>
            </template>
        </div>
        <div v-if="!_.isEmpty(pellet.nucleicAcid?.wellContents)" class="space-x-4 space-y-2">
            <div class="text-lg font-bold">PCR:</div>
            <hr>
            <div v-for="pcrEntry of _.sortBy(_.values(pcrEntries), 'plateType')">
                <div>
                    <strong>Plate:</strong> {{ pcrEntry.plateName }}
                </div>
                <div>
                    <strong>Plate type:</strong> {{ pcrEntry.plateTypeLabel }}
                </div>
                <div>
                    <strong>Wells:</strong> {{ pcrEntry.wells.map((well) => `${wellCoordinateToChar(well.y)}${well.x}`).join(', ') }}
                </div>
                <hr>
            </div>
        </div>
    </div>
</template>
