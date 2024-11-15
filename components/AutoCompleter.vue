<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'

const props = defineProps({
  searchBaseUrl: {type: String, required: true},
  searchFields: {type: Array, default: ['name']},
  valueField: {type: String, default: 'id'},
  displayFields: {type: Array, default: ['name']},
  searchWithClause: {type: Object},
})

const modelValue = defineModel()
const currentValue = ref()
const suggestions = ref([])

function getDisplayValue(record, delimiter=': ') {
    const result = []
    for (const field of props.displayFields) {
        result.push(_.get(record, field))
    }
    return _.join(result, delimiter)
}

onMounted(async () => {
    if (modelValue.value) {
        const record = await RecordService.getRecord(props.searchBaseUrl, modelValue.value, props.searchWithClause)
        currentValue.value = {code: modelValue.value, label: getDisplayValue(record) }
    }
})

async function autocompleteSearch(event) {
    const whereClause = props.searchFields.length > 1 ?
        {"or": _.map(props.searchFields, (x) => { return {"startsWith": [{"var": x}, event.query] } })} :
        {"startsWith": [{"var": props.searchFields[0]}, event.query] }
    const filtered = await RecordService.getRecords(props.searchBaseUrl, props.searchWithClause, whereClause)
    suggestions.value = _.map(filtered, (x) => { return {code: x[props.valueField], label: getDisplayValue(x) }})
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
