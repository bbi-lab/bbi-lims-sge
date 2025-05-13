<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'

const props = defineProps({
  parentSearchBaseUrl: {type: String, required: true},
  parentValueField: {type: String, default: 'id'},
  parentDisplayFields: {type: Array, default: ['name']},
  parentDisplayOptions: {type: Object},
  parentSearchWithClause: {type: Object},
  parentIftaLabel: {type: String},

  searchBaseUrl: {type: String, required: true},
  valueField: {type: String, default: 'id'},
  displayFields: {type: Array, default: ['name']},
  displayFormat: {type: Function},
  searchWithClause: {type: Object},
  searchWhereClause: {type: Object},
  parentKeyField: {type: String, required: true},

  hideClearButton: {type: Boolean},
  inputId: {type: String},
  placeholderValue: {type: String},
  inputClass: {type: String},
})

const modelValue = defineModel()
const parentValue = ref()
const parentAutoCompleter = ref()
const autoCompleter = ref()
const searchWhereClauseFinal = ref()
const mainRef = ref()

const emit = defineEmits([
    'clearedValue'
])

onMounted(async () => {
    if (modelValue.value) {
        const record = await RecordService.getRecord(props.searchBaseUrl, modelValue.value)
        parentValue.value = _.get(record, props.parentKeyField)
    }
})

watch(parentValue, (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
        const filter = {"==":[{"var": props.parentKeyField}, newValue]}
        searchWhereClauseFinal.value = props.searchWhereClause ? {and: [
                filter,
                props.searchWhereClause
            ]} : filter
    }
})

const parentValueChanged = (event) => {
    if (autoCompleter.value) {
        autoCompleter.value.clearValue()
        emit('clearedValue')
    }
}
const clearValues = (event) => {
    if (autoCompleter.value && parentAutoCompleter.value) {
        autoCompleter.value.clearValue()
        parentAutoCompleter.value.clearValue()
        emit('clearedValue')
    }
}
defineExpose({
    mainRef,
    parentValue,
})
</script>
<template>
    <div ref="mainRef" class="outline outline-gray-200 pt-5 pb-5 pl-2 w-96">
        <div class="mb-5">
            <AutoCompleter
                v-model="parentValue"
                ref="parentAutoCompleter"
                :iftaLabel="parentIftaLabel"
                :searchBaseUrl="parentSearchBaseUrl"
                :searchFields="parentDisplayFields"
                :valueField="parentValueField"
                :displayFields="parentDisplayFields"
                :searchWithClause="parentSearchWithClause"
                :dropdown="true"
                :hideClearButton="true"
                @changedValue="parentValueChanged"
            />
        </div>
        <div>
            <AutoCompleter
                v-model="modelValue"
                ref="autoCompleter"
                :input-id="inputId"
                :searchBaseUrl="searchBaseUrl"
                :searchFields="displayFields"
                :valueField="valueField"
                :displayFormat="displayFormat"
                :searchWithClause="searchWithClause"
                :searchWhereClause="searchWhereClauseFinal"
                :dropdown="true"
                :disabled="_.isEmpty(parentValue)"
                :hideClearButton="true"
                :placeholderValue="placeholderValue"
                :inputClass="inputClass"
            />
            <Button v-if="!_.isEmpty(parentValue) && !hideClearButton" class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="clearValues" />
        </div>
    </div>
</template>
