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
    return currentHarvestDay.value != 5 ? [] : _.map(experiment.value?.transfectTargets, (x) => {return {label: x.target.name, code: x.id}})
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
    return experiment.value?.data?.startedOn ? `${experiment.value?.data?.startedOn.toLocaleDateString('fr-CA')} @ ${experiment.value?.data?.startedOn.toLocaleTimeString('en-GB')}` : ''
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
    target: {label: string, code: string}
    transfections: string[]
    harvestDay: number
}

const pelletsToAdd = ref<DraftPellet[]>([])

const selectedTargets = ref<{label: string, code: string}[]>([])
const selectedPellets = ref<{label: string, code: TranfectionExperimentPellet}[]>([])
const selectedTransfections = ref<{label: string, code: string}[]>([])

const harvestBy = ref()
const harvestProtocol = ref()
const now = ref(new Date())

const validTransfectionsLimited = computed(() => experiment.value?.data?.replicateCount ? _.filter(VALID_TRANSFECTIONS, (x) => !_.startsWith(x, 'T') || parseInt(x.slice(-1)) <= (experiment.value?.data?.transfectionCount ?? 0)) : VALID_TRANSFECTIONS)
// set min date to Day 5, max to Day 17
const minDate = computed(() => experiment.value?.data?.startedOn ? moment(experiment.value?.data?.startedOn).set({ hour: 0, minute: 0 }).add(5, 'days').toDate() : new Date())
const maxDate = computed(() => moment(minDate?.value).set({ hour: 23, minute: 59 }).add(12, 'days').toDate())

// disable all dates in min/max range except Day 5, 9, 13, and 17
const disabledDates = computed (() => _.map([1,2,3,5,6,7,9,10,11], (x) => moment(minDate?.value).add(x, 'days').toDate()))

const targetsOrPelletsSelected = computed (() => {return !_.isEmpty(selectedTargets.value) || !_.isEmpty(selectedPellets.value)})

// const transfectionsSelected = computed (() => {return !_.isEmpty(selectedTransfections.value)})

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

async function addDraftPellets() {
    if (!currentHarvestDay.value) {
        return
    }
    const pellets:DraftPellet[] = []

    if (currentHarvestDay.value == 5) {
        for (const selectedTarget of selectedTargets.value) {
            let newPelletName = ''
            // check to make sure no pellets exist with any of same transfections
            const pelletWithSameTransfections = _.find(experiment.value?.pellets, (x) => {
                return selectedTarget.code == x.transfectTargetId &&
                    x.isBackup === formData.value.isBackup &&
                    _.some(x.transfections, (transfection) => {
                        return _.includes(_.map(selectedTransfections.value, 'code'), transfection)
                    })
            })

            const draftPelletWithSameTransfections = _.find(pelletsToAdd.value, (x) => {
                return x.target.code == selectedTarget.code &&
                    x.isBackup === formData.value.isBackup &&
                    _.some(x.transfections, (transfection) => {
                        return _.includes(_.map(selectedTransfections.value, 'code'), transfection)
                    })
            })
            if (pelletWithSameTransfections) {
                toast.add({ severity: 'error', summary: 'Warning', detail: `Day 5 pellet with same transfections already exists: ${pelletWithSameTransfections.name} (${_.join(pelletWithSameTransfections.transfections, ',')})`, life: 10000 })
                throw new Error('Pellet with same replicates already exists')
            } else if (draftPelletWithSameTransfections) {
                toast.add({ severity: 'error', summary: 'Warning', detail: `Day 5 draft pellet with same transfections already exists: ${draftPelletWithSameTransfections.name} (${_.join(draftPelletWithSameTransfections.transfections, ',')})`, life: 10000 })
                throw new Error('Draft pellet with same replicates already exists')
            } else {
                if (selectedTransfections.value.length == 1 && selectedTransfections.value[0].code == 'NC') {
                    newPelletName = `${selectedTarget.label}_D05_NC`
                } else {
                    const maxPelletByName = _.last(_.sortBy(_.filter(experiment.value?.pellets, (x) => x.transfectTargetId == selectedTarget.code), (x:any) => x.name))
                    const regex = /_R[0-9]+$/
                    const match = maxPelletByName?.name.match(regex)
                    if (match) {
                        const lastReplicate = maxPelletByName.name.slice(match.index + 2, maxPelletByName.name.length)
                        const nextReplicate = parseInt(lastReplicate) + 1
                        newPelletName = `${selectedTarget.label}_D05_R${nextReplicate}`
                    } else {
                        newPelletName = `${selectedTarget.label}_D05_R1`
                    }
                }
                pellets.push({
                    name: newPelletName,
                    target: selectedTarget,
                    harvestDay: currentHarvestDay.value,
                    transfections: _.map(selectedTransfections.value, (x) => x.code).sort(),
                    ..._.omit(_.cloneDeep(formData.value), ['selectedTransfections', 'selectedTargets'])
                })
            }
        }
    } else {
        for (const selectedPellet of _.map(selectedPellets.value, 'code')) {
            // const zeroPaddedDay = _.padStart(_.toString(currentHarvestDay.value), 2, '0')
            const target = _.find(experiment.value?.transfectTargets, (x) => x.id == selectedPellet.transfectTargetId)
            const newPelletName = selectedPellet.name

            // check to make sure no pellets exist with the same name
            const pelletWithSameName = _.find(experiment.value?.pellets, (x) => {
                return x.isBackup === formData.value.isBackup && x.name == newPelletName
            })
            if (pelletWithSameName) {
                toast.add({ severity: 'error', summary: 'Warning', detail: `Pellet already exists: ${newPelletName}`, life: 10000 })
                throw new Error('Pellet with same name already exists')
            }
            const draftPelletWithSameName = _.find(pelletsToAdd.value, (x) => {
                return x.isBackup === formData.value.isBackup && newPelletName == x.name
            })
            if (draftPelletWithSameName) {
                toast.add({ severity: 'error', summary: 'Warning', detail: `Draft pellet already exists: ${newPelletName}`, life: 10000 })
                throw new Error('Draft pellet with same name already exists')
            }
            if (!newPelletName || !target || !selectedPellet.transfections) {
                toast.add({ severity: 'error', summary: 'Warning', detail: `Error determining target/replicate`, life: 10000 })
                throw new Error('Error determining target/replicate')
            }
            pellets.push({
                name: newPelletName,
                target: {label: target.target.name, code: target?.id},
                harvestDay: currentHarvestDay.value,
                transfections: selectedPellet.transfections,
                ..._.omit(_.cloneDeep(formData.value), ['selectedTransfections', 'selectedTargets'])
            })
        }
    }
    pelletsToAdd.value.push(...pellets)
}

async function submitPellets() {
    const newPellets = _.map(pelletsToAdd.value, (x) => {
        const {target, ...vals} = x
        return {
            ...vals,
            transfectTargetId: target.code,
            harvestedOn: harvestDateTime.value,
            harvestedBy: harvestBy.value,
            protocol: _.get(harvestProtocol.value, 'code'),
        }
    })
    const response = await experiment.value?.addPellets(newPellets)
    if (response?.success) {
        toast.add({ severity: 'success', summary: 'Successful', detail: `${response?.data?.length} Records added`, life: 3000 })
        pelletsToAdd.value = []
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
                    showTime
                    showIcon
                    :minDate="minDate"
                    :maxDate="maxDate"
                    dateFormat="yy-mm-dd"
                    hourFormat="24"
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
                    <label for="harvestTargetsInput" class="block font-bold">Targets</label>
                    <Listbox id="harvestTargetsInput" v-model="selectedTargets" :options="allTargets" multiple checkmark optionLabel="label" class="w-full md:w-80" />
                </div>
                <div v-if="currentHarvestDay && currentHarvestDay>5" class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 space-y-5 mb-5">
                    <label for="harvestTargetsInput" class="block font-bold">Target Replicates</label>
                    <Listbox id="harvestTargetsInput" v-model="selectedPellets" :options="existingTargetReplicates" multiple checkmark optionLabel="label" class="w-full md:w-80" />
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3 space-y-3 mb-5">
                    <div v-if="currentHarvestDay==5" class="flex items-stretch w-60">
                        <label for="harvestTransfectionsInput" class="mt-auto mb-auto font-bold">Transfections</label>
                        <MultiSelect id="harvestTransfectionsInput" v inputClass="w-20" class="ml-auto" v-model="selectedTransfections" :options="valuesToCodedList(validTransfectionsLimited)" optionLabel="label" :showToggleAll="false" :maxSelectedLabels="3" :disabled="!targetsOrPelletsSelected"/>
                    </div>
                    <div class="flex items-stretch w-60">
                        <label for="pctPassagedInput" class="mt-auto mb-auto font-bold">% passaged</label>
                        <InputNumber id="pctPassagedInput" inputClass="w-20" class="ml-auto" v-model="formData.pctPassaged" showButtons :min="0" :max="100" :minFractionDigits="0" :maxFractionDigits="0" :disabled="!targetsOrPelletsSelected"/>
                    </div>
                    <div class="flex items-stretch w-60">
                        <label for="pctHarvestedInput" class="mt-auto mb-auto font-bold">% harvested</label>
                        <InputNumber id="pctHarvestedInput" inputClass="w-20" class="ml-auto" v-model="formData.pctHarvested" showButtons :min="0" :max="100" :minFractionDigits="0" :maxFractionDigits="0" :disabled="!targetsOrPelletsSelected"/>
                    </div>
                    <div class="flex items-stretch w-60">
                        <label for="d3ConfluencyInput" class="mt-auto mb-auto font-bold">% D3 confluency</label>
                        <InputNumber id="d3ConfluencyInput" inputClass="w-20" class="ml-auto" v-model="formData.d3Confluency" showButtons :min="0" :max="100" :minFractionDigits="0" :maxFractionDigits="0" :disabled="!targetsOrPelletsSelected"/>
                    </div>
                    <div class="flex items-stretch w-60">
                        <label for="harvestIsBackup"class="mt-auto mb-auto font-bold">Is backup?</label>
                        <Checkbox id="harvestIsBackup" class="ml-auto mr-7" v-model="formData.isBackup" binary :disabled="!targetsOrPelletsSelected" />
                    </div>
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3 space-y-3 mb-5">
                    <label for="notesInput" class="block font-bold">Notes</label>
                    <Textarea id="notesInput" v-model="formData.harvestNotes" rows="5" cols="30" :disabled="!targetsOrPelletsSelected" />
                    <div>
                        <Button
                            @click="addDraftPellets"
                            :disabled="(currentHarvestDay==5 && _.isEmpty(selectedTargets)) || (_.toInteger(currentHarvestDay) > 5 && _.isEmpty(selectedPellets))">
                            Add
                        </Button>
                    </div>
                </div>
                <div class="col-span-12 space-y-5 mb-5">
                    <DataTable :value="pelletsToAdd" tableStyle="min-width: 50rem">
                        <template #header>
                            <span class="text-xl font-bold">Draft pellets</span>
                        </template>
                        <template #empty> No data </template>
                        <Column>
                            <template #body="slotProps">
                                <Button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    text
                                    rounded
                                    @click="() => {pelletsToAdd.splice(pelletsToAdd.indexOf(slotProps.data), 1)}" />
                            </template>
                        </Column>
                        <Column field="name" header="Name"></Column>
                        <Column field="isBackup" header="Is Backup">
                            <template #body="slotProps">
                                {{ slotProps.data.isBackup ? '✓' : '' }}
                            </template>
                        </Column>
                        <Column field="target.label" header="Target"></Column>
                        <Column field="transfections" header="Transfections">
                            <template #body="slotProps">
                                {{ _.join(slotProps.data.transfections, ', ') }}
                            </template>
                        </Column>
                        <Column field="pctPassaged" header="% passaged"></Column>
                        <Column field="pctHarvested" header="% harvested"></Column>
                        <Column field="d3Confluency" header="% D3 confluency"></Column>
                        <Column field="harvestNotes" header="Notes"></Column>
                    </DataTable>
                </div>
                <div v-if="pelletsToAdd.length" class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 space-y-2 mb-5">
                    <Button
                        size="large"
                        icon="pi pi-bolt"
                        severity="warn"
                        :label="`Save ${pelletsToAdd.length} pellets`"
                        :disabled="!pelletsToAdd.length"
                        @click="submitPellets" />
                </div>
            </template>
                <div class="col-span-12 space-y-5 mb-5">
                    <DataTable :value="experiment?.pellets" tableStyle="min-width: 50rem">
                        <template #header>
                            <span class="text-xl font-bold">Existing pellets</span>
                        </template>
                        <template #empty> No data </template>
                        <Column field="name" header="Name"></Column>
                        <Column field="isBackup" header="Is Backup">
                            <template #body="slotProps">
                                {{ slotProps.data.isBackup ? '✓' : '' }}
                            </template>
                        </Column>
                        <Column field="transfections" header="Transfections">
                            <template #body="slotProps">
                                {{ _.join(slotProps.data.transfections, ', ') }}
                            </template>
                        </Column>
                        <Column field="harvestDay" header="Day"></Column>
                        <Column field="pctPassaged" header="% passaged"></Column>
                        <Column field="pctHarvested" header="% harvested"></Column>
                        <Column field="d3Confluency" header="% D3 confluency"></Column>
                        <Column field="harvestNotes" header="Notes"></Column>
                    </DataTable>
                </div>
        </div>
    </div>
</template>
