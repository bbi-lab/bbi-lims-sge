<script setup>
import { RecordService } from '@/utils/service/RecordService'
import moment from 'moment'
import _ from 'lodash'

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const experimentId = route.params.id

const currentExperiment = ref()
const harvestDateTime = ref()
const allTargets = ref([])
const pelletsToAdd = ref([])
const formData = ref({})
const harvestBy = ref()
const harvestProtocol = ref()
const now = ref(new Date())
const validProtocols = ['AllPrep', 'DNeasy']
const validReplicates = ['NC', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9']

// set min date to Day 5, max to Day 17
const minDate = computed(() => currentExperiment.value?.startedOn ? moment(currentExperiment.value.startedOn).add(5, 'days').toDate() : new Date()) // .set({ hour: 0, minute: 0 })
const maxDate = computed(() => moment(minDate?.value).add(12, 'days').toDate()) // .set({ hour: 23, minute: 59 })
// disable all dates in min/max range except Day 5, 9, 13, and 17
const disabledDates = computed (() => _.map([1,2,3,5,6,7,9,10,11], (x) => moment(minDate?.value).add(x, 'days').toDate()))
const targetsSelected = computed (() => {return !_.isEmpty(formData.value?.selectedTargets)})
const replicatesSelected = computed (() => {return !_.isEmpty(formData.value?.selectedReplicates)})

watch(currentExperiment, (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
        allTargets.value = _.map(newValue.transfectTargets, (x) => { return {label: formatTargetName(x.target), code: x.id}})
    }
})

onMounted(async() => {
    if (experimentId) {
        currentExperiment.value = await RecordService.getRecord(
            `${config.public.apiBase}/transfect-experiments`,
            experimentId,
            {transfectTargets: {columns: {id: true}, with: {target: {columns: {name: true}, with: {region: {columns: {name: true}, with: {gene: {columns: {symbol: true}}}}}}}}})
    }
    const intervalId = setInterval(() => {
      now.value = new Date()
    }, 1000)

    onUnmounted(() => {
        clearInterval(intervalId)
    })
})

function formatDateTime(value) {
    const isoDate = value ? new Date(value) : null
    return isoDate ? `${isoDate.toLocaleDateString('fr-CA')} @ ${isoDate.toLocaleTimeString('en-GB')}` : ''
}

function formatTargetName(val) {
    const targetName = _.get(val, 'name')
    const regionName = _.get(val, 'region.name')
    const geneSymbol = _.get(val, 'region.gene.symbol')
    return targetName ? `${targetName} (${geneSymbol}: ${regionName})` : `${geneSymbol}: ${regionName}`
}

const timeElapsed = computed(() => {
    const duration = moment.duration(moment(now.value).diff(moment(currentExperiment.value.startedOn)))
    if (Math.floor(duration.asDays()) < 18) {
        return `${Math.floor(duration.asDays())} days, ${duration.hours().toString().padStart(2, '0')}:${duration.minutes().toString().padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`
    } else {
        return '>17 days'
    }
})

function valuesToCodedList(array) {
    return _.map(array, (x) => {return {code: x, label: x}})
}

function addDraftPellets() {
    for (const target of formData.value?.selectedTargets) {
        pelletsToAdd.value.push({
            target,
            replicates: _.map(formData.value.selectedReplicates, (x) => x.code),
            ..._.omit(_.cloneDeep(formData.value), ['selectedReplicates', 'selectedTargets'])
        })
    }

}

function submitPellets() {
    const newPellets = _.cloneDeep(pelletsToAdd.value)
    for (const pellet of newPellets) {
        _.set(pellet, 'transfectTargetId', pellet.target.code)
        _.unset(pellet, 'target')
    }
    
    RecordService.addRecords(`${config.public.apiBase}/pellets`, newPellets).then((result) => {
        toast.add({ severity: 'success', summary: 'Successful', detail: `${result.length} Records added`, life: 3000 })
        pelletsToAdd.value = []
    }).catch(error => {
        toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
    })
}

</script>
<template>
    <div v-if="currentExperiment">
        <div class="grid grid-cols-12 p-5">
            <div class="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-4">
                <h5>Experiment: {{currentExperiment.name}}</h5>
                <div>Started on: {{ formatDateTime(currentExperiment.startedOn) }}</div>
                <div v-if="currentExperiment.startedOn">Time elapsed: {{ timeElapsed }}</div>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 mt-5">
                <Button 
                    size="large"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    severity="info"
                    label="View pellets"
                    @click="router.push({path:'/sge/pellets', query: {'experimentId': currentExperiment.id}})" />
            </div>
            <hr class="col-span-12">
            <div class="col-span-12">
                <h5>New harvest</h5>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 space-y-5 mb-5">
                <label for="harvestTargetsInput" class="block font-bold">Targets</label>
                <Listbox id="harvestTargetsInput" v-model="formData.selectedTargets" :options="allTargets" multiple checkmark optionLabel="label" class="w-full md:w-80" />
                
                <label for="harvestReplicatesInput" class="block font-bold">Replicates</label>
                <MultiSelect id="harvestReplicatesInput" v-model="formData.selectedReplicates" :options="valuesToCodedList(validReplicates)" optionLabel="label" :showToggleAll="false" :maxSelectedLabels="3" class="w-full md:w-80" :disabled="!targetsSelected"/>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3 space-y-3 mb-5">
                <div class="flex items-stretch w-60">
                    <label for="pctPassagedInput" class="mt-auto mb-auto font-bold">% passaged</label>
                    <InputNumber id="pctPassagedInput" inputClass="w-20" class="ml-auto" v-model="formData.pctPassaged" showButtons :min="0" :max="100" :minFractionDigits="0" :maxFractionDigits="0" :disabled="!targetsSelected"/> 
                </div>
                <div class="flex items-stretch w-60">
                    <label for="pctHarvestedInput" class="mt-auto mb-auto font-bold">% harvested</label>
                    <InputNumber id="pctHarvestedInput" inputClass="w-20" class="ml-auto" v-model="formData.pctHarvested" showButtons :min="0" :max="100" :minFractionDigits="0" :maxFractionDigits="0" :disabled="!targetsSelected"/>
                </div>
                <div class="flex items-stretch w-60">
                    <label for="d3ConfluencyInput" class="mt-auto mb-auto font-bold">% D3 confluency</label>
                    <InputNumber id="d3ConfluencyInput" inputClass="w-20" class="ml-auto" v-model="formData.d3Confluency" showButtons :min="0" :max="100" :minFractionDigits="0" :maxFractionDigits="0" :disabled="!targetsSelected"/>
                </div>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3 space-y-3 mb-5">
                <div class="flex items-stretch w-60">
                    <label for="dnaConcInput" class="mt-auto mb-auto font-bold">DNA conc (ng/μL)</label>
                    <InputNumber id="dnaConcInput" inputClass="w-24" class="ml-auto" v-model="formData.dnaConcentration" :min="0" :minFractionDigits="0" :maxFractionDigits="5" :disabled="!targetsSelected"/> 
                </div>
                <div class="flex items-stretch w-60">
                    <label for="dnaVolInput" class="mt-auto mb-auto font-bold">DNA vol (μL)</label>
                    <InputNumber id="dnaVolInput" inputClass="w-24" class="ml-auto" v-model="formData.dnaVolume" :min="0" :minFractionDigits="0" :maxFractionDigits="5" :disabled="!targetsSelected"/>
                </div>
                <div class="flex items-stretch w-60">
                    <label for="dnaYieldInput" class="mt-auto mb-auto font-bold">DNA yield (μg)</label>
                    <InputNumber id="dnaYieldInput" inputClass="w-24" class="ml-auto" v-model="formData.dnaYield" :min="0" :minFractionDigits="0" :maxFractionDigits="5" :disabled="!targetsSelected"/>
                </div>
                <div class="flex items-stretch w-60">
                    <label for="rnaConcInput" class="mt-auto mb-auto font-bold">RNA conc (ng/μL)</label>
                    <InputNumber id="dnaConcInput" inputClass="w-24" class="ml-auto" v-model="formData.rnaConcentration" :min="0" :minFractionDigits="0" :maxFractionDigits="5" :disabled="!targetsSelected"/> 
                </div>
                <div class="flex items-stretch w-60">
                    <label for="rnaVolInput" class="mt-auto mb-auto font-bold">RNA vol (μL)</label>
                    <InputNumber id="rnaVolInput" inputClass="w-24" class="ml-auto" v-model="formData.rnaVolume" :min="0" :minFractionDigits="0" :maxFractionDigits="5" :disabled="!targetsSelected"/>
                </div>
                <div class="flex items-stretch w-60">
                    <label for="rnaYieldInput" class="mt-auto mb-auto font-bold">RNA yield (μg)</label>
                    <InputNumber id="rnaYieldInput" inputClass="w-24" class="ml-auto" v-model="formData.rnaYield" :min="0" :minFractionDigits="0" :maxFractionDigits="5" :disabled="!targetsSelected"/>
                </div>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3 space-y-3 mb-5">
                <label for="harvestIsBackup" class="block font-bold">Is backup?</label>
                <Checkbox id="harvestIsBackup" v-model="formData.isBackup" binary :disabled="!targetsSelected" />
                <label for="notesInput" class="block font-bold">Notes</label>
                <Textarea id="notesInput" v-model="formData.harvestNotes" rows="5" cols="30" :disabled="!targetsSelected" />
                <div>
                    <Button @click="addDraftPellets" :disabled="!targetsSelected || !replicatesSelected">Add</Button>
                </div>
            </div>
            <div class="col-span-12 space-y-5 mb-10">
                <DataTable :value="pelletsToAdd" tableStyle="min-width: 50rem">
                    <template #header>
                        <span class="text-xl font-bold">Draft pellets</span>
                    </template>
                    <template #empty> No data </template>
                    <Column field="target.label" header="Target"></Column>
                    <Column field="replicates" header="Replicates">
                        <template #body="slotProps">
                            {{ _.join(slotProps.data.replicates, ', ') }}
                        </template>
                    </Column>
                    <Column field="pctPassaged" header="% passaged"></Column>
                    <Column field="pctHarvested" header="% harvested"></Column>
                    <Column field="d3Confluency" header="% D3 confl"></Column>
                    <Column field="dnaConcentration" header="DNA conc"></Column>
                    <Column field="dnaVolume" header="DNA vol"></Column>
                    <Column field="dnaYield" header="DNA yield"></Column>
                    <Column field="rnaConcentration" header="RNA conc"></Column>
                    <Column field="rnaVolume" header="RNA vol"></Column>
                    <Column field="rnaYield" header="RNA yield"></Column>
                    <Column field="isBackup" header="Backup">
                        <template #body="slotProps">
                            {{ slotProps.data.isBackup ? '✓' : '' }}
                        </template>
                    </Column>
                    <Column field="harvestNotes" header="Notes"></Column>
                </DataTable>
            </div>
            <template v-if="pelletsToAdd.length">
                <div class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-4 space-y-2">
                    <label for="harvestDateInput" class="block font-bold">Harvested on</label>
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
                        :disabled="!targetsSelected"
                    />
                    <span class="italic ml-5" v-if="harvestDateTime">Day {{ moment(harvestDateTime).diff(moment(currentExperiment.startedOn), 'days') }}</span>
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 space-y-2">
                    <label for="harvestByInput" class="block font-bold">Harvested by</label>
                    <div>
                        <AutoCompleter v-model="harvestBy" :searchBaseUrl="`${config.public.apiBase}/users`" dropdown hideClearButton  :disabled="!targetsSelected"/>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-2 space-y-2">
                    <label for="harvestProtocolInput" class="block font-bold">Protocol</label>
                    <Select class="w-48" id="harvestProtocolInput" v-model="harvestProtocol" :options="valuesToCodedList(validProtocols)" optionLabel="label" :disabled="!targetsSelected" />
                </div>
                <div class="col-span-12 md:col-span-6 lg:col-span-1 xl:col-span-1 space-y-2">
                    <Button 
                        size="large"
                        icon="pi pi-bolt"
                        severity="warn"
                        class="mt-5 mr-5"
                        :label="`Submit ${pelletsToAdd.length} pellets`"
                        :disabled="!pelletsToAdd.length"
                        @click="submitPellets" />
                </div>
            </template>
        </div>
    </div>
</template>
