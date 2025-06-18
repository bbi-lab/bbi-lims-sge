<script setup lang="ts">
import moment from 'moment'
import _ from 'lodash'
import  {
    TransfectionExperiment,
    // VALID_REPLICATES,
    VALID_TRANSFECTIONS,
    type TranfectionExperimentPellet,
} from '~/shared/sge/transfection-experiment'

const { user } = useUserSession()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const experimentId = route.params.id as string
const loaded = ref(false)

const experiment =  ref<TransfectionExperiment>()

const allTargets = computed(() => {
    return currentHarvestDay.value != 5 ? [] : _.map(experiment.value?.transfectTargets, (x) => {return {label: `${x.target.name} (${x.transfectionCount} transfections)`, code: x.id}})
})
const existingTargetReplicates = computed(() => {
    if (currentHarvestDay.value == 5) return []

    if (formData.value.isBackup) {
        return _.map(_.filter(experiment.value?.pellets, (x) => x.harvestDay == currentHarvestDay.value && !x.isBackup), (dayPellet) => {
            return dayPellet.name ? {
                label: dayPellet.name,
                code: dayPellet
            } : null
        })
    } else {
        const zeroPaddedDay = _.padStart(_.toString(currentHarvestDay.value), 2, '0')
        return currentHarvestDay.value == 5 ? [] : _.map(_.filter(experiment.value?.pellets, (x) => x.harvestDay == 5), (day5Pellet) => {
            return day5Pellet.name ? {
                label: _.replace(day5Pellet.name, '_D05_', `_D${zeroPaddedDay}_`),
                code: day5Pellet
            } : null
        })
    }

})

const experimentStartedOn = computed(() => {
    return experiment.value?.data?.startedOn ? `${experiment.value?.data?.startedOn.toLocaleDateString('fr-CA')}` : '' // @ ${experiment.value?.data?.startedOn.toLocaleTimeString('en-GB')}` : ''
})

const harvestDateTime = ref()
const currentHarvestDay = computed(() => {
    return harvestDateTime.value ? moment(harvestDateTime.value).diff(moment(experiment.value?.data?.startedOn).set( {hour: 0, minute: 0}), 'days') : null
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

// const validTransfectionsLimited = computed(() => experiment.value?.data?.replicateCount ? _.filter(VALID_TRANSFECTIONS, (x) => !_.startsWith(x, 'T') || parseInt(x.slice(-1)) <= (experiment.value?.data?.transfectionCount ?? 0)) : VALID_TRANSFECTIONS)
const validTransfectionsLimited = computed(() => {
    let transfectionList = experiment.value?.data?.negativeControl ? ['NC'] : []

    const experimentReplicateCount = experiment.value?.data?.replicateCount || 0
    if (selectedTransfectionTarget.value) {
        const transfectionCount = selectedTransfectionTarget.value.transfectionCount * experimentReplicateCount
        for (let i = 1; i <= transfectionCount; i++) {
            transfectionList.push(`T${i}`)
        }
    }
    return transfectionList
})

// set min date to Day 5, max to Day 17
const minDate = computed(() => experiment.value?.data?.startedOn ? moment(experiment.value?.data?.startedOn).set({ hour: 0, minute: 0 }).add(5, 'days').toDate() : new Date())
const maxDate = computed(() => moment(minDate?.value).set({ hour: 23, minute: 59 }).add(12, 'days').toDate())

// disable all dates in min/max range except Day 5, 9, 13, and 17
const disabledDates = computed (() => _.map([1,2,3,5,6,7,9,10,11], (x) => moment(minDate?.value).add(x, 'days').toDate()))

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
        // for (const selectedTarget of selectedTargets.value) {
        let newPelletName = ''
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
            let transfections: string[]
            if (_.map(selectedTransfections.value, 'code').includes('NC')) {
                newPelletName = `${selectedTransfectionTarget.value?.target.name}_D05_NC`
                transfections = ['NC']
            } else {
                transfections = _.map(selectedTransfections.value, 'code').sort()
                const maxPelletByName = _.last(_.sortBy(_.filter(experiment.value?.pellets, (x) => x.transfectTargetId == selectedTarget.value!.code), (x:any) => x.name))
                const regex = /_R[0-9]+$/
                const match = maxPelletByName?.name.match(regex)
                if (match) {
                    const lastReplicate = maxPelletByName.name.slice(match.index + 2, maxPelletByName.name.length)
                    const nextReplicate = parseInt(lastReplicate) + 1
                    newPelletName = `${selectedTransfectionTarget.value?.target.name}_D05_R${nextReplicate}`
                } else {
                    newPelletName = `${selectedTransfectionTarget.value?.target.name}_D05_R1`
                }
            }
            pellets.push({
                name: newPelletName,
                transfectTargetId: selectedTransfectionTarget.value?.id,
                harvestDay: currentHarvestDay.value,
                transfections,
                ..._.omit(_.cloneDeep(formData.value), ['selectedTransfections', 'selectedTarget'])
            })
        }
        // }
    } else {
        for (const selectedPellet of selectedPellets.value) {
            // const zeroPaddedDay = _.padStart(_.toString(currentHarvestDay.value), 2, '0')
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
        await refreshExperiment()
    } else {
        toast.add({ severity: 'error', summary: 'Error adding pellets', life: 3000 })
    }
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
                <div>Negative control: {{ experiment?.data?.negativeControl }}</div>
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
                    <DataTable :value="experiment?.pellets" tableStyle="min-width: 50rem">
                        <template #header>
                            <span class="text-xl font-bold">Existing pellets</span>
                        </template>
                        <template #empty> No data </template>
                        <Column field="name" header="Name" sortable></Column>
                        <Column field="isBackup" header="Is Backup" sortable>
                            <template #body="slotProps">
                                {{ slotProps.data.isBackup ? '✓' : '' }}
                            </template>
                        </Column>
                        <Column field="transfections" header="Transfections" sortable>
                            <template #body="slotProps">
                                {{ _.join(slotProps.data.transfections, ', ') }}
                            </template>
                        </Column>
                        <Column field="harvestDay" header="Day" sortable></Column>
                        <Column field="pctPassaged" header="% passaged" sortable></Column>
                        <Column field="pctHarvested" header="% harvested" sortable></Column>
                        <Column field="d3Confluency" header="% D3 confluency" sortable></Column>
                        <Column field="harvestNotes" header="Notes" sortable></Column>
                    </DataTable>
                </div>
        </div>
    </div>
</template>
