<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'

const props = defineProps({
  searchBaseUrl: {type: String, required: true},
  searchFields: {type: Array, default: ['name']},
  valueField: {type: String, default: 'id'},
  displayFields: {type: Array, default: ['name']},
  displayFormat: {type: Function},  // callback function to return formatted string
  searchWithClause: {type: Object},
  searchWhereClause: {type: Object},
  dropdown: {type: Boolean},
  disabled: {type: Boolean},
  hideClearButton: {type: Boolean},
  iftaLabel: {type: String},
  inputId: {type: String},
})

const modelValue = defineModel()
const modelValueObj = defineModel('obj')
const currentValue = ref()
const suggestions = ref([])

const emit = defineEmits([
    'value-changed'
])

function getDisplayValue(record) {
    const result = []

    if (_.isFunction(props.displayFormat)) {
        return props.displayFormat(record)
    } else {
        for (const field of props.displayFields) {
            result.push(_.get(record, field))
        }
        return _.join(_.compact(result), ': ')
    }
}

watch(modelValue, async (newValue, oldValue) => {
    
    if (newValue && !_.isEqual(newValue, oldValue)) {
        if (_.isObject(newValue)) {
            modelValueObj.value = newValue
        } else if (_.isEmpty(newValue)) {
            modelValueObj.value = null
        }

        modelValue.value = _.isString(newValue) ?  newValue : _.get(newValue, props.valueField)
        
        if (_.isString(modelValue.value)) {
            const record = await RecordService.getRecord(props.searchBaseUrl, modelValue.value, props.searchWithClause)
            currentValue.value = {code: modelValue.value, label: getDisplayValue(record) }
        }
    }},
    { immediate: true },
)

async function autocompleteSearch(event) {
    let whereClause = props.searchFields.length > 1 ?
        {"or": _.map(props.searchFields, (x) => { return {"startsWith": [{"var": x}, event.query] } })} :
        {"startsWith": [{"var": props.searchFields[0]}, event.query] }

    if (props.searchWhereClause) {
        whereClause = {"and": [whereClause, props.searchWhereClause]}
    }
    const filtered = await RecordService.getRecords(props.searchBaseUrl, props.searchWithClause, whereClause)

    suggestions.value = _.map(filtered, (x) => { return {code: x[props.valueField], label: getDisplayValue(x), record: x }})
}

function clearValue() {
    currentValue.value = null
    modelValue.value = null
    modelValueObj.value = null
    emit('value-changed', null)
}
function setModelValue() {
    if (_.has(currentValue.value, 'code')) {
        modelValue.value = _.get(currentValue.value, 'code')
        modelValueObj.value = _.get(currentValue.value, 'record')
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
defineExpose({
    clearValue,
})
//const inputId = useId()

</script>
<template>
    <component :is="_.isEmpty(iftaLabel) ? 'span' : 'IftaLabel'">
        <AutoComplete 
            v-model="currentValue" 
            class="w-80"
            :id="inputId"
            :suggestions="suggestions" 
            optionLabel="label"
            @complete="autocompleteSearch"
            @option-select="setModelValue"
            @blur="lostFocus"
            :dropdown="dropdown"
            :disabled="disabled" />
        <label v-if="!_.isEmpty(iftaLabel)" :for="inputId">{{ iftaLabel }}</label>
    </component>
    
    <Button v-if="!disabled && !hideClearButton" class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="clearValue" />
</template>

<style>
.p-autocomplete-input {
    width: 100%;
}
</style>
