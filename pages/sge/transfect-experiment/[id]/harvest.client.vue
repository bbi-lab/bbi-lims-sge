<script setup lang="ts">
import moment from 'moment'
import _ from 'lodash'
import  {
    TransfectionExperiment,
    type TranfectionExperimentPellet,
} from '~/shared/sge/transfection-experiment'
import { getWellTextColor, wellCoordinateToChar } from '~/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import type { WellContent } from '~/server/db/schema/sge/well'
import type { ColumnDefinitions } from '~/components/QuickTable.client.vue'
import type { FieldDefinitions } from '~/components/QuickForm.vue'

const { user } = useUserSession()
const config = useRuntimeConfig()
const route = useRoute()
const toast = useToast()
const { breakpoints } = useLayout()
const experimentId = route.params.id as string
const loaded = ref(false)
const displayDeleteConfirmation = ref(false)
const selectedExistingPellets = ref()
const experiment =  ref<TransfectionExperiment>()
const harvestDateTime = ref()
const selectedPlate = ref()
const pelletPlateKey = ref(0) // used to force re-render of PlateDiagram
const plateWithWellSpecs = ref()
const plateLayout = usePlateLayout()
const smallerThanLg = breakpoints.smaller('lg')
const crudTable = useCrudTable()
const crudTableKey = ref(0)

const showPelletEditDialog = computed(() => {
    return crudTable.state.showEditForm || crudTable.state.showMultipleEditForm
})

const allTargets = computed(() => {
    return currentHarvestDay.value != 5 ? [] : _.map(experiment.value?.transfectTargets, (x) => {return {label: `${x.target.name} (${x.transfectionCount} transfections per replicate)`, code: x.id}})
})
const existingTargetReplicates = computed(() => {
    if (currentHarvestDay.value == 5) return []

    if (formData.value.isBackup) {
        return _.sortBy(_.map(_.filter(experiment.value?.pellets, (x) => x.harvestDay == currentHarvestDay.value && !x.isBackup), (dayPellet) => {
            return dayPellet.name ? {
                label: dayPellet.name,
                code: dayPellet
            } : null
        }), 'label')
    } else {
        const zeroPaddedDay = _.padStart(_.toString(currentHarvestDay.value), 2, '0')
        return currentHarvestDay.value == 5 ? [] : _.sortBy(_.map(_.filter(experiment.value?.pellets, (x) => x.harvestDay == 5), (day5Pellet) => {
            return day5Pellet.name ? {
                label: _.replace(day5Pellet.name, '_D05_', `_D${zeroPaddedDay}_`),
                code: day5Pellet
            } : null
        }), 'label')
    }

})

const experimentStartedOn = computed(() => {
    return experiment.value?.data?.startedOn ? `${experiment.value?.data?.startedOn.toLocaleDateString('fr-CA')}` : '' // @ ${experiment.value?.data?.startedOn.toLocaleTimeString('en-GB')}` : ''
})

const currentHarvestDay = computed(() => {
    return harvestDateTime.value ? moment(harvestDateTime.value).diff(moment(experiment.value?.data?.startedOn).set( {hour: 0, minute: 0}), 'days') : null
})

const loadPlate = async () => {
    await plateLayout.loadPlate(
        {
            pellet: {
                with: {
                    transfectTarget: {
                        with: {
                            target: {
                                with: {
                                    region: {
                                        with: {
                                            gene: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    )

    plateWithWellSpecs.value = {
        ...plateLayout.plateWithWellContents.value,
        wells: _.values(plateLayout.wellSpecs.value),
    }
}
watch(selectedPlate, async (newValue, oldValue) => {
    if (newValue && newValue != oldValue) {
        plateLayout.setPlateId(newValue)
        await loadPlate()
        pelletPlateKey.value++
    } else {
        plateWithWellSpecs.value = null
    }
})

interface FormFields {
    pctPassaged?: number
    pctHarvested?: number
    d3Confluency?: number
    isBackup?: boolean
    harvestNotes?: string
}
const formData = ref<FormFields>({})

interface DraftPellet extends Partial<FormFields> {
    name: string
    transfectTargetId: string
    transfections: string[]
    harvestDay: number
}

const selectedTarget = ref<{label: string, code: string}>()
const selectedPellets = ref<{label: string, code: TranfectionExperimentPellet}[]>([])
const selectedTransfections = ref<{label: string, code: string}[]>([])

const selectedTransfectionTarget = computed(() => {
    return _.find(experiment.value?.transfectTargets, (x) => x.id == selectedTarget.value?.code)
})

const harvestBy = ref()
const harvestProtocol = ref()
const now = ref(new Date())

const validTransfectionsLimited = computed(() => {
    const transfectionList: string[] = []

    const experimentReplicateCount = experiment.value?.data?.replicateCount || 0
    if (selectedTransfectionTarget.value) {
        if (selectedTransfectionTarget.value?.negativeControl) {
            transfectionList.push('NC')
        }
        const transfectionCount = selectedTransfectionTarget.value.transfectionCount * experimentReplicateCount
        for (let i = 1; i <= transfectionCount; i++) {
            transfectionList.push(`T${i}`)
        }
    }
    return transfectionList
})

// set min date to Day 5, max to Day 21
const minDate = computed(() => experiment.value?.data?.startedOn ? moment(experiment.value?.data?.startedOn).set({ hour: 0, minute: 0 }).add(5, 'days').toDate() : new Date())
const maxDate = computed(() => moment(minDate?.value).set({ hour: 23, minute: 59 }).add(16, 'days').toDate())

// disable all dates in min/max range except Day 5, 9, 13, 17, and 21
const disabledDates = computed (() => _.map([1,2,3,5,6,7,9,10,11,13,14,15], (x) => moment(minDate?.value).add(x, 'days').toDate()))

const targetOrPelletsSelected = computed (() => {return selectedTarget.value || !_.isEmpty(selectedPellets.value)})

onMounted(async() => {
    await refreshExperiment()

    // set default harvested by value to current user
    harvestBy.value = _.get(user.value, 'id')

    const intervalId = setInterval(() => {
      now.value = new Date()
    }, 1000)

    onUnmounted(() => {
        clearInterval(intervalId)
    })

    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: ['pellet.transfectTarget.target.name'],
        selectionTableRecordIdPaths: ['pellet.id'],
        tooltip: (well: any) => {
            const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
            const pelletName = _.get(well, ['wellContents', 0, 'wellable', 'pellet', 'name'])
            return pelletName ? `${wellCoordinate}:<br>${pelletName}` : wellCoordinate
        },
    }
    plateLayout.selectionTableRef.value = crudTable.tableRef.value
})

async function refreshExperiment() {
    if (experimentId) {
        experiment.value = new TransfectionExperiment(experimentId)
        await experiment.value.fetch()

        loaded.value = true
    }
}

function formatDateTime(value: Date) {
    return value ? `${value.toLocaleDateString('fr-CA')} @ ${value.toLocaleTimeString('en-GB')}` : ''
}

const timeElapsed = computed(() => {
    const duration = moment.duration(moment(now.value).diff(moment(experiment.value?.data?.startedOn)))
    if (Math.floor(duration.asDays()) < 18) {
        return `${Math.floor(duration.asDays())} days, ${duration.hours().toString().padStart(2, '0')}:${duration.minutes().toString().padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`
    } else {
        return '>17 days'
    }
})

function valuesToCodedList(array: any[]) {
    return _.map(array, (x) => {return {code: x, label: x}})
}

async function addPellets() {
    if (!currentHarvestDay.value) {
        return
    }
    const pellets: DraftPellet[] = []

    if (currentHarvestDay.value == 5) {
        // check to make sure no pellets exist with any of same transfections
        const pelletWithSameTransfections = _.find(experiment.value?.pellets, (x) => {
            return selectedTarget.value!.code == x.transfectTargetId &&
                x.isBackup === formData.value.isBackup &&
                _.some(x.transfections, (transfection) => {
                    return _.includes(_.map(selectedTransfections.value, 'code'), transfection)
                })
        })
        if (pelletWithSameTransfections) {
            toast.add({ severity: 'error', summary: 'Warning', detail: `Day 5 pellet with same transfections already exists: ${pelletWithSameTransfections.name} (${_.join(pelletWithSameTransfections.transfections, ',')})`, life: 10000 })
            throw new Error('Pellet with same replicates already exists')
        } else {
            // determine new pellet name based on existing pellets
            let transfections: string[]
            let newPelletName
            if (_.map(selectedTransfections.value, 'code').includes('NC')) {
                newPelletName = `${selectedTransfectionTarget.value?.target.name}_D05_NC_${experiment.value?.name}`
                transfections = ['NC']
            } else {
                transfections = _.map(selectedTransfections.value, 'code').sort()
                const maxPelletByName = _.last(_.sortBy(_.filter(experiment.value?.pellets, (x) => x.transfectTargetId == selectedTarget.value!.code && x.harvestDay == 5), (x:any) => x.name))
                const regex = /_D05_R([0-9]+)_/
                const match = maxPelletByName?.name.match(regex)
                if (match) {
                    const lastReplicate = match[1]
                    const nextReplicate = parseInt(lastReplicate) + 1
                    // check to make sure we are not exceeding replicate count for experiment
                    if (experiment.value?.data?.replicateCount && nextReplicate > experiment.value.data.replicateCount) {
                        toast.add({ severity: 'error', summary: 'Warning', detail: `Maximum number of day 5 replicates reached for target: ${selectedTransfectionTarget.value?.target.name}`, life: 10000 })
                        throw new Error('Maximum number of day 5 replicates reached for target')
                    }
                    newPelletName = `${selectedTransfectionTarget.value?.target.name}_D05_R${nextReplicate}_${experiment.value?.name}`
                } else {
                    newPelletName = `${selectedTransfectionTarget.value?.target.name}_D05_R1_${experiment.value?.name}`
                }
            }
            if (newPelletName) {
                pellets.push({
                    name: newPelletName,
                    transfectTargetId: selectedTransfectionTarget.value?.id as string,
                    harvestDay: currentHarvestDay.value,
                    transfections,
                    ..._.omit(_.cloneDeep(formData.value), ['selectedTransfections', 'selectedTarget'])
                })
            }
        }
    } else {
        for (const selectedPellet of selectedPellets.value) {
            const target = _.find(experiment.value?.transfectTargets, (x) => x.id == selectedPellet.code.transfectTargetId)
            const newPelletName = selectedPellet.label

            // check to make sure no pellets exist with the same name
            const pelletWithSameName = _.find(experiment.value?.pellets, (x) => {
                return x.isBackup === formData.value.isBackup && x.name == newPelletName
            })
            if (pelletWithSameName) {
                toast.add({ severity: 'error', summary: 'Warning', detail: `Pellet already exists: ${newPelletName}`, life: 10000 })
                throw new Error('Pellet with same name already exists')
            }
            if (!newPelletName || !target || !selectedPellet.code.transfections) {
                toast.add({ severity: 'error', summary: 'Warning', detail: `Error determining target/replicate`, life: 10000 })
                throw new Error('Error determining target/replicate')
            }
            pellets.push({
                name: newPelletName,
                transfectTargetId: target?.id,
                harvestDay: currentHarvestDay.value,
                transfections: selectedPellet.code.transfections,
                ..._.omit(_.cloneDeep(formData.value), ['selectedTransfections', 'selectedTarget'])
            })
        }
    }
    submitPellets(pellets)
}
async function didClickDeleteSelectedRecords() {
    const pelletIds = _.map(selectedExistingPellets.value, 'id')
    const response = await experiment.value?.deletePellets(pelletIds)
    if (response?.success) {
        toast.add({ severity: 'success', summary: 'Successful', detail: `${response?.data?.length} Records deleted`, life: 3000 })
        await refreshExperiment()
    } else {
        toast.add({ severity: 'error', summary: 'Error deleting pellets', life: 3000 })
    }
    displayDeleteConfirmation.value = false
}

async function submitPellets(pellets: DraftPellet[]) {
    const newPellets = _.map(pellets, (x) => {
        return {
            ...x,
            harvestedOn: harvestDateTime.value,
            harvestedBy: harvestBy.value,
            protocol: _.get(harvestProtocol.value, 'code'),
        }
    })
    const response = await experiment.value?.addPellets(newPellets)

    if (response?.success) {
        toast.add({ severity: 'success', summary: 'Successful', detail: `${response?.data?.length} Records added`, life: 3000 })
        crudTableKey.value++

        // Add pellets to empty wells if storage box is selected
        if (plateWithWellSpecs.value) {
            const wells = plateWithWellSpecs.value.wells
            const emptyWells = _.orderBy(_.filter(wells, (x) => _.isEmpty(x.data?.wellContents)), ['y', 'x'])

            if (emptyWells.length == 0) {
                toast.add({ severity: 'warn', summary: 'Warning', detail: `No empty wells available`, life: 3000 })
                return
            }
            const wellContentsToAdd = _.map(response?.data, (pellet, index) => {
                return {
                    wellId: emptyWells?.[index]?.id,
                    wellableId: pellet.id,
                }
            })
            const wellContentsAdded = await RecordService.addRecords(
                `${config.public.apiBase}/well-contents`,
                wellContentsToAdd
            ) as WellContent[]

            if (!_.isEmpty(wellContentsAdded) && wellContentsAdded?.length == response.data?.length) {
                toast.add({ severity: 'success', summary: 'Successful', detail: `${wellContentsAdded?.length} wells populated`, life: 3000 })
                await loadPlate()
                pelletPlateKey.value++
            } else {
                toast.add({ severity: 'error', summary: 'Error adding well contents', life: 3000 })
            }
        }
        await refreshExperiment()
    } else {
        if (response?.error && _.isArray(response.error) && _.size(response.error) > 0) {
            for (const err of response.error) {
                toast.add({ severity: 'error', summary: 'Error adding pellet', detail: err.description || '', life: 10000 })
            }
        } else {
            toast.add({ severity: 'error', summary: 'Error adding pellets', life: 3000 })
        }
    }
}

const pelletsWithClause = Object.freeze({
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
                    id: true,
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
                with: {
                    cycle: {
                        columns: {
                            name: true
                        }
                    }
                },
            }
        }
    },
    dna: {
        columns: {
            id: true
        },
    },
    rna: {
        columns: {
            id: true
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
    },
})

const columnDefs: ColumnDefinitions = {
    colorTile:{
        index: 0,
        header: '',
        sortable: false,
        type: 'element',
        element: (x: any) => {
            const wellSpec = plateLayout.getWellSpecBySelectionTableRecordId(x.id)
            return wellSpec ? `<span
                class="inline-block w-6 h-6 rounded-sm text-center"
                style="color: ${getWellTextColor(wellSpec.color)}; background-color:${wellSpec.color}">
                ${wellSpec.symbol}
            </span>` : ''
        },
        searchable: false,
        exportable: false,
    },
    name: {
        index: 1,
    },
    isBackup: {
        index: 2,
    },
    isCurrent: {
        index: 3,
    },
    dna: {
        header: 'DNA',
        index: 4,
        type: 'element',
        element: (x: any) => {
            const href = _.has(x, 'dna.id') ? `/sge/dna?pelletId=${x.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">✓</a>` : ''
        },
        exportValue: (x: any) => {
            return _.has(x, 'dna.id') ? 'true' : 'false'
        },
    },
    rna: {
        header: 'RNA',
        index: 5,
        type: 'element',
        element: (x: any) => {
            const href = _.has(x, 'rna.id') ? `/sge/rna?pelletId=${x.id}` : null
            return href ? `<a href="${href}" class="text-blue-500 hover:underline">✓</a>` : ''
        },
        exportValue: (x: any) => {
            return _.has(x, 'rna.id') ? 'true' : 'false'
        },
    },
    transfectionExperiment: {
        path: 'transfectTarget.experiment.cycle.name',
        index: 6,
    },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            return combinedWellLocations(x) as string
        },
        path: 'wellContents.displayValue',
        type: 'string',
        index: 7,
    },
    transfectTarget: {
        header: 'Target',
        format: (x: any) => { return _.get(x, 'transfectTarget.target.name') || `${_.get(x, 'transfectTarget.target.region.gene.symbol')} : ${_.get(x, 'transfectTarget.target.region.name')}`},
        path: 'transfectTarget.displayValue',
        type: 'string',
        index: 8,
    },
    transfectTargetId: {
        display: false,
    },
    harvestedBy: {
        path: 'harvestedBy.name',
    },
}
const pelletsWhereClause = {
    '==': [{ 'var': 'transfectTarget.experiment.id' }, route.params.id ]
}
const rowActions = {
    assign: {
        label: '',
        icon: 'pi pi-arrow-right',
        tooltip: 'Assign to selected well',
        disabled: () => !selectedPlate.value || plateLayout.selectedWells.value.length === 0,
        action: async (data: any) => {
            if (plateLayout.selectedWells.value.length > 1) {
                toast.add({ severity: 'warn', summary: 'Multiple wells selected', detail: 'Please select only one well to assign a pellet.', life: 3000 })
                return
            } else if (!_.isEmpty(plateLayout.selectedWells.value[0].data.wellContents)) {
                toast.add({ severity: 'warn', summary: 'Well already has contents', detail: 'Please select an empty well to assign a pellet.', life: 3000 })
                return
            } else {
                await plateLayout.assignIdToSelectedWells(data.id)
                crudTable.didUpdateRecord(data)
            }
        }
    }
}
const fieldDefs: FieldDefinitions = {
    transfectTargetId: {
        label: 'Target',
        component: 'NestedSelect',
        props: {
            parentSearchBaseUrl: `${config.public.apiBase}/transfect-experiments`,
            parentSearchFields: ['cycle.name'],
            parentValueField: 'id',
            parentDisplayFields: ['cycle.name'],
            parentIftaLabel: 'Experiment',
            parentSearchWithClause: {
                cycle: {columns: {name: true}},
            },

            searchBaseUrl: `${config.public.apiBase}/transfect-targets`,
            searchFields: ['target.name', 'target.region.gene.symbol', 'target.region.name'],
            valueField: 'id',
            displayFormat: (x:any) => { return x.target?.name ?? `${x.target?.region?.gene?.symbol}:${x.target.region.name}`},
            parentKeyField: 'experimentId',
            searchWithClause: {
                target: {columns: {name: true}, with: {region: {columns: {name: true}, with: {gene: {columns: {symbol: true}}}}}},
            },
        },
        readOnly: true,
    },
    extractionExperimentId: {
        label: 'Extraction experiment',
        component: 'AutoCompleter',
        props: {
            searchBaseUrl: `${config.public.apiBase}/extraction-experiments`,
            searchFields: ['name'],
            valueField: 'id',
            displayFields: ['name'],
            dropdown: true,
        }
    },
    harvestedOn: {
        readOnly: true,
    },
    harvestDay: {
        readOnly: true,
    },
}
</script>
<template>
    <div v-if="loaded">
        <div class="grid grid-cols-12 p-5">
            <div class="col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12">
                <h5>{{ experiment?.name }} transfection</h5>
                <div>Started on: {{ experimentStartedOn }}</div>
                <div v-if="experimentStartedOn">Time elapsed: {{ timeElapsed }}</div>
                <div>Number of replicates: {{ experiment?.data?.replicateCount }}</div>
            </div>
            <hr class="col-span-12">
            <div class="col-span-12 text-xl font-bold mb-5">New harvest</div>
            <div class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 space-y-2">
                <label for="harvestDateInput" class="block font-bold">
                    Harvest date {{ currentHarvestDay ? `(Day ${currentHarvestDay})` : '' }}
                </label>
                <DatePicker
                    class="w-80"
                    id="harvestDateInput"
                    v-model.trim="harvestDateTime"
                    showIcon
                    :minDate="minDate"
                    :maxDate="maxDate"
                    dateFormat="yy-mm-dd"
                    autofocus
                    :disabledDates="disabledDates"
                />
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 space-y-2">
                <label for="harvestByInput" class="block font-bold">Harvested by</label>
                <div>
                    <AutoCompleter v-model="harvestBy" :searchBaseUrl="`${config.public.apiBase}/users`" dropdown hideClearButton />
                </div>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 space-y-2">
                <label for="plateSelector" class="block font-bold">
                    Storage box
                </label>
                <div>
                    <AutoCompleter
                        id="plateSelector"
                        v-model="selectedPlate"
                        :searchBaseUrl="`${config.public.apiBase}/plates`"
                        :searchWhereClause="{'==':[{'var': 'plateType'}, 'pellet-storage']}"
                        dropdown />
                </div>
            </div>
            <hr class="col-span-12">
            <template v-if="harvestDateTime && harvestBy">
                <div v-if="currentHarvestDay==5" class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 space-y-5 mb-5">
                    <label for="harvestTargetsInput" class="block font-bold">Target</label>
                    <Dropdown id="harvestTargetsInput" v-model="selectedTarget" :options="allTargets" optionLabel="label" class="w-full md:w-80" />
                    <!-- <Listbox id="harvestTargetsInput" v-model="selectedTargets" :options="allTargets" multiple checkmark optionLabel="label" class="w-full md:w-80" /> -->
                </div>
                <div v-if="currentHarvestDay && currentHarvestDay>5" class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 space-y-5 mb-5">
                    <label for="harvestTargetsInput" class="block font-bold">Target Replicates</label>
                    <Listbox id="harvestTargetsInput" v-model="selectedPellets" :options="existingTargetReplicates" multiple checkmark optionLabel="label" class="w-full md:w-80" />
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3 space-y-3 mb-5">
                    <div v-if="currentHarvestDay==5" class="flex items-stretch w-60">
                        <label for="harvestTransfectionsInput" class="mt-auto mb-auto font-bold">Transfections</label>
                        <MultiSelect
                            id="harvestTransfectionsInput"
                            inputClass="w-20"
                            class="ml-auto"
                            v-model="selectedTransfections"
                            :options="valuesToCodedList(validTransfectionsLimited)"
                            :optionDisabled="(option) => (option.code == 'NC' && !_.isEmpty(_.filter(selectedTransfections, (x) => x.code!='NC'))) ||
                                (option.code != 'NC' && selectedTransfections[0]?.code == 'NC') ||
                                (!_.map(selectedTransfections, 'code').includes(option.code) && selectedTransfections.length >= selectedTransfectionTarget!.transfectionCount)"
                            optionLabel="label"
                            :showToggleAll="false"
                            :maxSelectedLabels="3"
                            :disabled="!selectedTransfectionTarget"
                        />
                    </div>
                    <div class="flex items-stretch w-60">
                        <label for="pctPassagedInput" class="mt-auto mb-auto font-bold">% passaged</label>
                        <InputNumber id="pctPassagedInput" inputClass="w-20" class="ml-auto" v-model="formData.pctPassaged" showButtons :min="0" :max="100" :minFractionDigits="0" :maxFractionDigits="0" :disabled="!targetOrPelletsSelected"/>
                    </div>
                    <div class="flex items-stretch w-60">
                        <label for="pctHarvestedInput" class="mt-auto mb-auto font-bold">% harvested</label>
                        <InputNumber id="pctHarvestedInput" inputClass="w-20" class="ml-auto" v-model="formData.pctHarvested" showButtons :min="0" :max="100" :minFractionDigits="0" :maxFractionDigits="0" :disabled="!targetOrPelletsSelected"/>
                    </div>
                    <div class="flex items-stretch w-60">
                        <label for="d3ConfluencyInput" class="mt-auto mb-auto font-bold">% D3 confluency</label>
                        <InputNumber id="d3ConfluencyInput" inputClass="w-20" class="ml-auto" v-model="formData.d3Confluency" showButtons :min="0" :max="100" :minFractionDigits="0" :maxFractionDigits="0" :disabled="!targetOrPelletsSelected"/>
                    </div>
                    <div class="flex items-stretch w-60">
                        <label for="harvestIsBackup"class="mt-auto mb-auto font-bold">Is backup?</label>
                        <Checkbox id="harvestIsBackup" class="ml-auto mr-7" v-model="formData.isBackup" binary :disabled="!targetOrPelletsSelected" />
                    </div>
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3 space-y-3 mb-5">
                    <label for="notesInput" class="block font-bold">Notes</label>
                    <Textarea id="notesInput" v-model="formData.harvestNotes" rows="5" cols="30" :disabled="!targetOrPelletsSelected" />
                    <div>
                        <Button
                            @click="addPellets"
                            :disabled="(currentHarvestDay==5 && !selectedTarget) || (_.toInteger(currentHarvestDay) > 5 && _.isEmpty(selectedPellets))">
                            Add
                        </Button>
                    </div>
                </div>
            </template>
            <div class="col-span-12 space-y-5 mb-5">
                <Splitter class="h-full overflow-y-hidden" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
                    <SplitterPanel class="overflow-scroll" :size="60">
                        <QuickTable
                            :key="crudTableKey"
                            :ref="crudTable.setTableRef"
                            tableName="pellets"
                            title="Pellets"
                            schemaName="select"
                            :columnDefs="columnDefs"
                            :rowActions="rowActions"
                            :withClause="pelletsWithClause"
                            :where="pelletsWhereClause"
                            :canAdd="false"
                            :canEditMultiple="true"
                            @clickedRecordEdit="crudTable.didClickRecordEdit"
                            @clickedMultipleRecordEdit="crudTable.didClickMultipleRecordEdit"
                        />
                    </SplitterPanel>
                    <SplitterPanel class="flex flex-col overflow-scroll mt-10" :size="40" :minSize="25" v-if="plateWithWellSpecs">
                        <div class="flex justify-end mr-10 mb-5">
                            <Button class="ml-1" v-tooltip="{value: 'Close'}" severity="info" icon="pi pi-times" size="small" @click="selectedPlate = null" />
                        </div>
                        <div class="ml-auto mr-auto">
                            <PlateDiagram
                                :key="pelletPlateKey"
                                :ref="plateLayout.setPlateDiagramRef"
                                v-if="plateWithWellSpecs"
                                v-model="plateWithWellSpecs"
                                :plateType="plateWithWellSpecs.plateType"
                                :sizeX="plateWithWellSpecs.sizeX"
                                :sizeY="plateWithWellSpecs.sizeY"
                                @well-range-selected="plateLayout.wellRangeSelected"
                                @well-selection-cleared="plateLayout.wellSelectionCleared"
                                @all-wells-selected="plateLayout.selectedAllWells"
                                @well-contents-updated="plateLayout.updatedWellContents"
                            >
                            <template #button1>
                                <Button
                                    class="p-button-secondary"
                                    icon="pi pi-trash"
                                    v-tooltip="{value: 'Empty selected wells', showDelay: 500}"
                                    :disabled="_.isEmpty(plateLayout.selectedWells.value)"
                                    @click="plateLayout.emptySelectedWells" />
                            </template>
                            </PlateDiagram>
                        </div>
                    </SplitterPanel>
                </Splitter>
                <Dialog header="Confirmation" v-model:visible="displayDeleteConfirmation" :style="{ width: '350px' }" :modal="true">
                    <div class="flex items-center justify-center">
                        <i class="pi pi-exclamation-triangle mr-4" style="font-size: 2rem" />
                        <span>Are you sure you want to proceed?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" @click="displayDeleteConfirmation=!displayDeleteConfirmation" text severity="secondary" />
                        <Button label="Yes" icon="pi pi-check" @click="didClickDeleteSelectedRecords" severity="danger" outlined autofocus />
                    </template>
                </Dialog>
                <Dialog v-model:visible="showPelletEditDialog" modal header="Edit" class="w-auto" :closable="false">
                    <QuickForm
                        v-if="crudTable.state.editingRecordId && crudTable.state.showEditForm"
                        :recordId="crudTable.state.editingRecordId"
                        tableName="pellets"
                        schemaName="update"
                        :canDelete="false"
                        :fieldDefs="fieldDefs"
                        @cancel="crudTable.didClickCancelEditForm"
                        @recordUpdate="crudTable.didUpdateRecord"
                    />
                    <QuickFormMultiple
                        v-if="crudTable.state.showMultipleEditForm"
                        tableName="pellets"
                        :recordIds="crudTable.state.editingMultipleRecordsIds"
                        schemaName="update"
                        :fieldDefs="fieldDefs"
                        @cancel="crudTable.didClickCancelMultipleEditForm"
                        @records-update="crudTable.didUpdateMultipleRecords"
                    />
                </Dialog>
            </div>
        </div>
    </div>
</template>
