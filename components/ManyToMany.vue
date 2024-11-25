<script setup>
import { RecordService } from '@/utils/service/RecordService'
import _ from 'lodash'

const props = defineProps({
    baseUrl: String,
    fixedValueField: String,
    variableField: String,
    component: String,
    componentProps: Object,
})

const modelValue = defineModel()

</script>
<template>
    <AutoCompleter
        v-if="component=='AutoCompleter'"
        v-model="modelValue[variableField]"
        v-bind="componentProps"
        :hide-clear-button="true"
    />
</template>
