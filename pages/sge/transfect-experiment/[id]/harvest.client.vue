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

// set min date to Day 5, max to Day 17
const minDate = computed(() => currentExperiment.value?.startedOn ? moment(currentExperiment.value.startedOn).add(5, 'days').set({ hour: 0, minute: 0 }).toDate() : new Date())
const maxDate = computed(() => moment(minDate?.value).add(12, 'days').set({ hour: 23, minute: 59 }).toDate())
// disable all dates in min/max range except Day 5, 9, 13, and 17
const disabledDates = computed (() => _.map([1,2,3,5,6,7,9,10,11], (x) => moment(minDate?.value).add(x, 'days').toDate()))

onMounted(async() => {
    if (experimentId) {
        currentExperiment.value = await RecordService.getRecord(`${config.public.apiBase}/transfect-experiments`, experimentId)
    }
})

function formatDateTime(value) {
    const isoDate = value ? new Date(value) : null
    return isoDate ? `${isoDate.toLocaleDateString('fr-CA')} at ${isoDate.toLocaleTimeString()}` : ''
}
</script>
<template>
    <div v-if="currentExperiment">
        <h5>Experiment: {{currentExperiment?.name}}</h5>
        <div>Started on: {{ formatDateTime(currentExperiment.startedOn) }}</div>
        <div v-if="currentExperiment.startedOn">Days elapsed: {{ moment().diff(moment(currentExperiment.startedOn), 'days') }}</div>
        <hr>
        <h4>New harvest</h4>

        <label for="harvestDateInput" class="block font-bold mb-3">Date</label>
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
        <span class="ml-3" v-if="harvestDateTime">Day {{ moment(harvestDateTime).diff(moment(currentExperiment.startedOn), 'days') }}</span>
        <hr>

        <label for="pelletCountInput" class="block font-bold mb-3"># of pellets</label>
        <InputNumber id="pelletCountInput" v-model="pelletCount" showButtons :min="1" :minFractionDigits="0" :maxFractionDigits="0" /> 
                
    </div>
</template>
