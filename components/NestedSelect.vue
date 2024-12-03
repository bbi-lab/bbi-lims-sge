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
  displayOptions: {type: Object},
  searchWithClause: {type: Object},
  parentKeyField: {type: String, required: true},

  hideClearButton: {type: Boolean}
})

const modelValue = defineModel()
const parentValue = ref()

onMounted(async () => {
    if (modelValue.value) {
        const record = await RecordService.getRecord(props.searchBaseUrl, modelValue.value)
        parentValue.value = _.get(record, props.parentKeyField)
    }
})

function parentValueChanged(event) {
    modelValue.value = ''
}
function clearValues(event) {
    parentValue.value = ''
    modelValue.value = ''
}
</script>
<template>
    <div class="outline outline-gray-200 pt-5 pb-5 pl-2 w-96">
        <div class="mb-5">
            <AutoCompleter
                v-model="parentValue"
                :iftaLabel="parentIftaLabel"
                :searchBaseUrl="parentSearchBaseUrl"
                :searchFields="parentDisplayFields"
                :valueField="parentValueField"
                :displayFields="parentDisplayFields"
                :displayOptions="parentDisplayOptions"
                :searchWithClause="parentSearchWithClause"
                :dropdown="true"
                :hideClearButton="true"
                @value-changed="parentValueChanged"
            />
        </div>
        <div>
            <AutoCompleter 
                v-model="modelValue"
                :searchBaseUrl="searchBaseUrl"
                :searchFields="displayFields"
                :valueField="valueField"
                :displayFields="displayFields"
                :displayOptions="displayOptions"
                :searchWithClause="searchWithClause"
                :dropdown="true"
                :disabled="_.isEmpty(parentValue)"
                :hideClearButton="true"
            />
            <Button v-if="!_.isEmpty(parentValue) && !hideClearButton" class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="clearValues" />
        </div>
    </div>
</template>
