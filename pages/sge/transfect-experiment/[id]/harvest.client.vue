<script setup lang="ts">
import moment from 'moment'
import _ from 'lodash'
import  {
    TransfectionExperiment,
    VALID_REPLICATES,
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
    return currentHarvestDay.value == 5 ? [] : _.map(_.filter(experiment.value?.pellets, (x) => x.harvestDay == 5), (day5Pellet) => {
        return day5Pellet.name ? {
            label: _.replace(day5Pellet.name, '_D05_', '_'),
            code: day5Pellet
        } : null
    })
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
    replicates: string[]
    harvestDay: number
}

const pelletsToAdd = ref<DraftPellet[]>([])

const selectedTargets = ref<{label: string, code: string}[]>([])
const selectedTargetReplicates = ref<{label: string, code: Object}[]>([])
const selectedReplicates = ref<{label: string, code: string}[]>([])

const harvestBy = ref()
const harvestProtocol = ref()
const now = ref(new Date())

const validReplicatesLimited = computed(() => experiment.value?.data?.replicateCount ? _.filter(VALID_REPLICATES, (x) => !_.startsWith(x, 'R') || parseInt(x.slice(-1)) <= (experiment.value?.data?.replicateCount ?? 0)) : VALID_REPLICATES)
// set min date to Day 5, max to Day 17
const minDate = computed(() => experiment.value?.data?.startedOn ? moment(experiment.value?.data?.startedOn).set({ hour: 0, minute: 0 }).add(5, 'days').toDate() : new Date())
const maxDate = computed(() => moment(minDate?.value).set({ hour: 23, minute: 59 }).add(12, 'days').toDate())

// disable all dates in min/max range except Day 5, 9, 13, and 17
const disabledDates = computed (() => _.map([1,2,3,5,6,7,9,10,11], (x) => moment(minDate?.value).add(x, 'days').toDate()))

const targetsOrPelletsSelected = computed (() => {return !_.isEmpty(selectedTargets.value) || !_.isEmpty(selectedTargetReplicates.value)})

const replicatesSelected = computed (() => {return !_.isEmpty(selectedReplicates.value)})

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
            // check to make sure no pellets exist with any of same replicates
            const pelletWithSameReplicates = _.find(experiment.value?.pellets, (x) => {
                return selectedTarget.code == x.transfectTargetId && _.some(x.replicates, (replicate) => {
                    return _.includes(_.map(selectedReplicates.value, 'code'), replicate)
                })
            })

            const draftPelletWithSameReplicates = _.find(pelletsToAdd.value, (x) => {
                return x.target.code == selectedTarget.code && _.some(x.replicates, (replicate) => {
                    return _.includes(_.map(selectedReplicates.value, 'code'), replicate)
                })
            })
            if (pelletWithSameReplicates) {
                toast.add({ severity: 'error', summary: 'Warning', detail: `Day 5 pellet with same replicates already exists: ${pelletWithSameReplicates.name} (${_.join(pelletWithSameReplicates.replicates, ',')})`, life: 10000 })
                throw new Error('Pellet with same replicates already exists')
            } else if (draftPelletWithSameReplicates) {
                toast.add({ severity: 'error', summary: 'Warning', detail: `Day 5 draft pellet with same replicates already exists: ${draftPelletWithSameReplicates.name} (${_.join(draftPelletWithSameReplicates.replicates, ',')})`, life: 10000 })
                throw new Error('Draft pellet with same replicates already exists')
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
                pellets.push({
                    name: newPelletName,
                    target: selectedTarget,
                    harvestDay: currentHarvestDay.value,
                    replicates: _.map(selectedReplicates.value, (x) => x.code).sort(),
                    ..._.omit(_.cloneDeep(formData.value), ['selectedReplicates', 'selectedTargets'])
                })
            }
        }
    } else {
        for (const selectedPellet of _.map(selectedTargetReplicates.value, 'code')) {
            const zeroPaddedDay = _.padStart(_.toString(currentHarvestDay.value), 2, '0')
            const target = _.find(experiment.value?.transfectTargets, (x) => x.id == selectedPellet.transfectTargetId)
            const newPelletName = _.replace(selectedPellet.name, '_D05_', `_D${zeroPaddedDay}_`)

            // check to make sure no pellets exist with the same name
            const pelletWithSameName = _.find(experiment.value?.pellets, (x) => {
                return x.name == newPelletName
            })
            if (pelletWithSameName) {
                toast.add({ severity: 'error', summary: 'Warning', detail: `Pellet already exists: ${newPelletName}`, life: 10000 })
                throw new Error('Pellet with same name already exists')
            }
            const draftPelletWithSameName = _.find(pelletsToAdd.value, (x) => {
                return newPelletName == x.name
            })
            if (draftPelletWithSameName) {
                toast.add({ severity: 'error', summary: 'Warning', detail: `Draft pellet already exists: ${newPelletName}`, life: 10000 })
                throw new Error('Draft pellet with same name already exists')
            }

            pellets.push({
                name: newPelletName,
                target: {label: target?.target.name, code: target?.id},
                harvestDay: currentHarvestDay.value,
                replicates: selectedPellet.replicates,
                ..._.omit(_.cloneDeep(formData.value), ['selectedReplicates', 'selectedTargets'])
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
                    <Listbox id="harvestTargetsInput" v-model="selectedTargetReplicates" :options="existingTargetReplicates" multiple checkmark optionLabel="label" class="w-full md:w-80" />
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3 space-y-3 mb-5">
                    <div v-if="currentHarvestDay==5" class="flex items-stretch w-60">
                        <label for="harvestReplicatesInput" class="mt-auto mb-auto font-bold">Replicates</label>
                        <MultiSelect id="harvestReplicatesInput" v inputClass="w-20" class="ml-auto" v-model="selectedReplicates" :options="valuesToCodedList(validReplicatesLimited)" optionLabel="label" :showToggleAll="false" :maxSelectedLabels="3" :disabled="!targetsOrPelletsSelected"/>
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
                            :disabled="(currentHarvestDay==5 && _.isEmpty(selectedTargets)) || (_.toInteger(currentHarvestDay) > 5 && _.isEmpty(selectedTargetReplicates))">
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
                        <Column field="target.label" header="Target"></Column>
                        <Column field="replicates" header="Replicates">
                            <template #body="slotProps">
                                {{ _.join(slotProps.data.replicates, ', ') }}
                            </template>
                        </Column>
                        <Column field="pctPassaged" header="% passaged"></Column>
                        <Column field="pctHarvested" header="% harvested"></Column>
                        <Column field="d3Confluency" header="% D3 confluency"></Column>
                        <Column field="isBackup" header="Backup">
                            <template #body="slotProps">
                                {{ slotProps.data.isBackup ? '✓' : '' }}
                            </template>
                        </Column>
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
                        <Column field="replicates" header="Replicates">
                            <template #body="slotProps">
                                {{ _.join(slotProps.data.replicates, ', ') }}
                            </template>
                        </Column>

                        <Column field="harvestDay" header="Day"></Column>
                        <Column field="pctPassaged" header="% passaged"></Column>
                        <Column field="pctHarvested" header="% harvested"></Column>
                        <Column field="d3Confluency" header="% D3 confluency"></Column>
                        <Column field="isBackup" header="Backup">
                            <template #body="slotProps">
                                {{ slotProps.data.isBackup ? '✓' : '' }}
                            </template>
                        </Column>
                        <Column field="harvestNotes" header="Notes"></Column>
                    </DataTable>
                </div>
        </div>
    </div>
</template>
