<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'

const props = defineProps({
  searchBaseUrl: {type: String, required: true},
  searchFields: {type: Array, default: ['name']},
  valueField: {type: String, default: 'id'},
  displayFields: {type: Array, default: ['name']}
})

const modelValue = defineModel()
const currentValue = ref()
const suggestions = ref([])

onMounted(async () => {
    if (modelValue.value) {
        const record = await RecordService.getRecord(props.searchBaseUrl, modelValue.value)
        currentValue.value = {code: modelValue.value, label: record[props.displayFields[0]] }
    }
})

async function autocompleteSearch(event) {
    const whereClause = {"startsWith": [{"var": props.searchFields[0]}, event.query] }
    const filtered = await RecordService.getRecords(props.searchBaseUrl, null, whereClause)
    suggestions.value = _.map(filtered, (x) => { return {code: x[props.valueField], label: x[props.displayFields[0]] }})
}

function clearValue() {
    currentValue.value = null
    modelValue.value = null
}
function setModelValue() {
    modelValue.value = _.get(currentValue.value, 'code')
}
</script>
<template>
    <AutoComplete 
        v-model="currentValue" 
        :suggestions="suggestions" 
        optionLabel="label"
        @complete="autocompleteSearch"
        @option-select="setModelValue" />
    <Button icon="pi pi-times" severity="secondary" outlined @click="clearValue" />
</template>
