<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'

const props = defineProps({
  searchBaseUrl: {type: String, required: true},
  searchFields: {type: Array, default: ['name']},
  valueField: {type: String, default: 'id'},
  displayFields: {type: Array, default: ['name']},
  /* 
    EX:
    displayOptions: {
        primary: {
            fields: ['name', 'desc'],
            operator: 'coalesce',
        },
        secondary: {
            fields: ['another.value', 'another.value2'],
            operator: 'join',
            delimiter: '; ',
        }
    }
  */
  displayOptions: {type: Object},
  searchWithClause: {type: Object},
  dropdown: {type: Boolean},
  disabled: {type: Boolean},
  hideClearButton: {type: Boolean},
  iftaLabel: {type: String},
})

const modelValue = defineModel()
const currentValue = ref()
const suggestions = ref([])

const emit = defineEmits([
    'value-changed'
])

function getDisplayValue(record) {
    const result = []
    let optionUsed = 'default'

    if (props.displayOptions) {
        for (const field of props.displayOptions.primary.fields) {
            if (_.get(record, field)) result.push(_.get(record, field))
        }
        if (result.length>0) {
            optionUsed = 'primary'
        } else {
            if (props.displayOptions?.secondary) {
                for (const field of props.displayOptions.secondary.fields) {
                    result.push(_.get(record, field))
                }
                optionUsed = 'secondary'
            }
        }
    } else {
        for (const field of props.displayFields) {
            result.push(_.get(record, field))
        }
    }

    const delimiter = _.get(props.displayOptions, [optionUsed, 'delimiter'], ': ')
    const operator = _.get(props.displayOptions, [optionUsed, 'operator'], 'join')
    if (operator=='join') {
        return _.join(_.compact(result), delimiter)
    } else if (operator=='coalesce') {
        return _.find(result, (value) => !_.isEmpty(value))
    }
}

watch(modelValue, async (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
        const record = await RecordService.getRecord(props.searchBaseUrl, modelValue.value, props.searchWithClause)
        currentValue.value = {code: modelValue.value, label: getDisplayValue(record) }
    }},
    { immediate: true },
)

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
    emit('value-changed', null)
}
function setModelValue() {
    if (_.has(currentValue.value, 'code')) {
        modelValue.value = _.get(currentValue.value, 'code')
        emit('value-changed', modelValue.value)
    } else {
        clearValue()
    }
}
async function lostFocus() {
    if (!_.has(currentValue.value, 'code')) {
        clearValue()
    }
}
const inputId = useId()

</script>
<template>
    <component :is="_.isEmpty(iftaLabel) ? 'span' : 'IftaLabel'">
        <AutoComplete 
            v-model="currentValue" 
            class="w-80"
            inputId="inputId"
            :suggestions="suggestions" 
            optionLabel="label"
            @complete="autocompleteSearch"
            @option-select="setModelValue"
            @blur="lostFocus"
            :dropdown="dropdown"
            :disabled="disabled" />
        <label v-if="!_.isEmpty(iftaLabel)" for="inputId">{{ iftaLabel }}</label>
    </component>
    
    <Button v-if="!disabled && !hideClearButton" class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="clearValue" />
</template>

<style>
.p-autocomplete-input {
    width: 100%;
}
</style>
