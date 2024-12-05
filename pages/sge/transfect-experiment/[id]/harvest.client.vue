<script setup>
import { RecordService } from '@/utils/service/RecordService'
import moment from 'moment'
import _ from 'lodash'

const config = useRuntimeConfig()
const route = useRoute()
const experimentId = route.params.id

const currentExperiment = ref()
const harvestDateTime = ref()
const pelletCount = ref()
const allTargets = ref([])
const selectedTargets = ref([])
const pctPassaged = ref(0)
const pctHarvested = ref(0)
const harvestNotes = ref()
const harvestBy = ref()
const harvestProtocol = ref()
const now = ref(new Date())
const availableProtocols = [{code: 'AllPrep', label: 'AllPrep'}, {code: 'DNeasy', label: 'DNeasy'}]

// set min date to Day 5, max to Day 17
const minDate = computed(() => currentExperiment.value?.startedOn ? moment(currentExperiment.value.startedOn).add(5, 'days').set({ hour: 0, minute: 0 }).toDate() : new Date())
const maxDate = computed(() => moment(minDate?.value).add(12, 'days').set({ hour: 23, minute: 59 }).toDate())
// disable all dates in min/max range except Day 5, 9, 13, and 17
const disabledDates = computed (() => _.map([1,2,3,5,6,7,9,10,11], (x) => moment(minDate?.value).add(x, 'days').toDate()))

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
    if (duration.days() < 18) {
        return `${duration.days()} days, ${duration.hours().toString().padStart(2, '0')}:${duration.minutes().toString().padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`
    } else {
        return '>17 days'
    }
})

</script>
<template>
    <div v-if="currentExperiment">
        <div class="grid grid-cols-12 gap-8 bg-white p-5">
            <div class="col-span-12">
                <h5>Experiment: {{currentExperiment?.name}}</h5>
                <div>Started on: {{ formatDateTime(currentExperiment.startedOn) }}</div>
                <div v-if="currentExperiment.startedOn">Time elapsed: {{ timeElapsed }}</div>
            </div>
            <div class="col-span-12">
                <h4>New harvest</h4>
            </div>
            <div class="col-span-12 lg:col-span-5 xl:col-span-4 space-y-5">
                <label for="harvestTargetsInput" class="block font-bold">Targets</label>
                <Listbox id="harvestTargetsInput" v-model="selectedTargets" :options="allTargets" multiple checkmark optionLabel="label" class="w-full md:w-56" />

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
                     :disabled="_.isEmpty(selectedTargets)"
                />
                <span class="italic ml-5" v-if="harvestDateTime">Day {{ moment(harvestDateTime).diff(moment(currentExperiment.startedOn), 'days') }}</span>
                
                <label for="harvestByInput" class="block font-bold">Harvested by</label>
                <AutoCompleter v-model="harvestBy" :searchBaseUrl="`${config.public.apiBase}/users`" dropdown hideClearButton  :disabled="_.isEmpty(selectedTargets)"/>
            </div>
            <div class="col-span-12 lg:col-span-4 xl:col-span-3 space-y-5">
                <label for="pelletCountInput" class="block font-bold"># of pellets</label>
                <InputNumber id="pelletCountInput" v-model="pelletCount" showButtons :min="1" :minFractionDigits="0" :maxFractionDigits="0" :disabled="_.isEmpty(selectedTargets)"/> 

                <label for="pctPassagedInput" class="block font-bold">% passaged</label>
                <InputNumber id="pctPassagedInput" v-model="pctPassaged" showButtons suffix=" %" :min="0" :minFractionDigits="0" :maxFractionDigits="0"  :disabled="_.isEmpty(selectedTargets)"/> 

                <label for="pctHarvestedInput" class="block font-bold">% harvested</label>
                <InputNumber id="pctHarvestedInput" v-model="pctHarvested" showButtons suffix=" %" :min="0" :minFractionDigits="0" :maxFractionDigits="0"  :disabled="_.isEmpty(selectedTargets)"/>
                
                <label for="harvestProtocolInput" class="block font-bold">Protocol</label>
                <Select class="w-48" id="harvestProtocolInput" v-model="harvestProtocol" :options="availableProtocols" optionLabel="label" :disabled="_.isEmpty(selectedTargets)"/>

            </div>
            <div class="col-span-12 lg:col-span-4 xl:col-span-3  space-y-5">
                <label for="notesInput" class="block font-bold">Notes</label>
                <Textarea id="notesInput" v-model="harvestNotes" rows="5" cols="30" :disabled="_.isEmpty(selectedTargets)" />
                <div>
                    <Button>Submit</Button>
                </div>
            </div>
        </div>
    </div>
</template>
