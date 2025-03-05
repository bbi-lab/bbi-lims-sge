<script setup lang="ts">
import _ from 'lodash'
import { RecordService } from '@/utils/service/RecordService'

// types here can be refined further based on JsonSchema, but this is a good starting point
interface SchemaItems {
    properties?: Record<string, { default?: any }>;
    type?: string;
    enum?: string[];
    oneOf?: Record<string, SchemaItems>[];
    anyOf?: Record<string, SchemaItems>;
    items?: SchemaItems;
}
interface FormSchema {
    properties: Record<string, SchemaItems>;
}

const config = useRuntimeConfig()
const confirmPopup = useConfirm()

const apiBaseUrl = computed(() => `${config.public.apiBase}/${props.tableName}`)
const schemasUrl = computed(() => `${config.public.apiBase}/schemas/${props.tableName}`)

const formSchemPropertiesComputed = computed(() => _.mapValues(formSchema.value?.properties || {}, (x) => x.anyOf ? _.find(x.anyOf, (x) => x.type != 'null') : x))

const props = defineProps({
  recordIds: {type: Array as PropType<Array<string>>, required: true},
  tableName: {type: String, required: true},
  schemaName: {type: String, required: true},
  readOnly: {type: Boolean, default: false},
  withClause: {type: Object},
  fieldDefs: {type: Object},                 // to override widgets/labels for individual fields
  defaultValues: {type: Object},             // to hide fields on form
})
const emit = defineEmits([
    'records-update',
    'cancel'
])
const dataChanged = ref(false)
const formSchema = ref<FormSchema>()
const records = ref<Array<Record<string, any>>>([])
const combinedRecord = ref<Record<string, any>>({})
const relatedRecords = ref<Record<string, any>>({})

onMounted(() => refreshForm())

const refreshForm = async function() {
    formSchema.value = await RecordService.getSchema(schemasUrl.value, props.schemaName)
    records.value = await RecordService.getRecordsByIds(apiBaseUrl.value, props.recordIds, props.withClause)

    combinedRecord.value = _.reduce(records.value, (acc: any, record) => {
        _.forEach(record, (value, key) => {
            if (key == 'id') return  // ignore ids
            if (acc[key] === undefined) {
                acc[key] = value
            } else if (!_.isEqual(value, acc[key])) {
                acc[key] = {__conflictingValues: _.get(acc, [key, '__conflictingValues'], 0) + 1 }
            } else {
                acc[key] = value
            }
        })
        console.log(acc)
        return acc
    }, {})
    dataChanged.value = false
}

async function saveRecords() {
    if (props.readOnly) return
}

function cancelEdit(event: MouseEvent) {
    if (dataChanged.value) {
        confirmPopup.require({
            target: event.target as HTMLElement,
            message: 'Unsaved changes',
            icon: 'pi pi-exclamation-triangle',
            rejectProps: {
                label: 'Go back',
                severity: 'secondary',
                outlined: true
            },
            acceptProps: {
                label: 'Discard changes',
                severity: 'warn'
            },
            accept: () => { emit('cancel') },
            reject: () => { }
        })
    } else {
        emit('cancel')
    }
}
function isReadOnly(key: string) {
    return props.readOnly ? true : _.has(props.defaultValues, key) || _.get(props.fieldDefs, [key, 'readOnly'], false)
}
function getLabel(key: string) {
    const label = _.get(props.fieldDefs, [key, 'label'])
    if (_.isFunction(label)) {
        return label(_.cloneDeep(combinedRecord.value), _.cloneDeep(relatedRecords.value))
    } else if (label) {
        return label
    } else {
        return _.get(props.fieldDefs, [`${key}.*`, 'label'], formatFieldLabel(key))
    }
}
function getFieldType(val: any, key: string) {
    const fieldType = _.get(props.fieldDefs, [key, 'type'])
    console.log(key)
    if (fieldType) {
        return fieldType
    } else if (_.isArray(val.type) && _.includes(val.type, 'null') && val.type.length == 2) {
        // getting field type for nullable fields
        return _.find(val.type, (x) => x != 'null')
    } else if (val.format=='date-time' || val.anyOf?.[0]?.format=='date-time') {
        return 'date-time'
    } else if (val.format=='date' || val.anyOf?.[0]?.format=='date') {
        return 'date'
    } else {
        // no field type defined
        return val.type
    }
}
</script>
<template>
    <div class="m-2 w-full flex justify-center">
        <Button class="ml-1" v-tooltip="{value: `${dataChanged ? 'Cancel' : 'Close'}`, showDelay: 1000}" severity="info" :icon="`pi ${dataChanged ? 'pi-undo' : 'pi-times'}`" size="small" @click="cancelEdit" />
        <Button v-if="!readOnly" class="ml-1" v-tooltip="{value: 'Save', showDelay: 1000}" icon="pi pi-save" size="small" :disabled="!dataChanged" @click="saveRecords" />
    </div>
    <div class="pl-8 pb-24 h-full overflow-y-scroll">
        {{ combinedRecord }}
        <hr />
        <div v-for="(val, key) in formSchemPropertiesComputed" class="mt-5">
            <template v-if="combinedRecord && key in combinedRecord && _.get(fieldDefs, [key, 'display'])!==false">
                <div class="mb-5" v-if="_.get(fieldDefs, [key, 'component'])=='AutoCompleter'">
                    <label :for="key" class="block font-bold mb-3">{{ _.get(fieldDefs, [key, 'label'], formatFieldLabel(key)) }}</label>
                    <AutoCompleter 
                        :input-id="key"
                        v-model="combinedRecord[key]"
                        v-model:obj="relatedRecords[key]"
                        v-bind="_.get(fieldDefs, [key, 'props'])"
                        :disabled="isReadOnly(key)"
                    />
                </div>
                <div class="mb-5" v-else-if="_.get(fieldDefs, [key, 'component'])=='NestedSelect'">
                    <label :for="key" class="block font-bold mb-3">{{ _.get(fieldDefs, [key, 'label'], formatFieldLabel(key)) }}</label>
                    <NestedSelect 
                        :input-id="key"
                        v-model="combinedRecord[key]"
                        v-bind="_.get(fieldDefs, [key, 'props'])"
                        :disabled="isReadOnly(key)"
                    />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key)=='date'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <DatePicker 
                        class="w-80"
                        :id="key"
                        v-model.trim="combinedRecord[key]"
                        showIcon
                        dateFormat="yy-mm-dd"
                        autofocus
                        :disabled="isReadOnly(key)"
                    />
                    <Button icon="pi pi-times" class="ml-2" severity="secondary" outlined @click="record[key]=null" />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key)=='date-time'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <DatePicker 
                        class="w-80"
                        :id="key"
                        v-model.trim="combinedRecord[key]" 
                        showTime 
                        showIcon
                        dateFormat="yy-mm-dd"
                        hourFormat="24"
                        autofocus
                        :disabled="isReadOnly(key)"
                    />
                    <Button icon="pi pi-times" class="ml-2" severity="secondary" outlined @click="combinedRecord[key]=null" />
                </div>
                <div class="mb-5" v-else-if="val?.enum">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Select :id="key" v-model="combinedRecord[key]" :options="val.enum" :disabled="isReadOnly(key)" />
                </div>
                <div class="mb-5" v-else-if="val?.oneOf">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Select :id="key" v-model="combinedRecord[key]" :options="val.oneOf" optionLabel="title" optionValue="const" :disabled="isReadOnly(key)"/>
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key)=='boolean'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Checkbox :id="key" v-model="combinedRecord[key]" :binary="true" :disabled="isReadOnly(key)" />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key)=='integer'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputNumber :id="key" v-model="combinedRecord[key]" showButtons :disabled="isReadOnly(key)" :minFractionDigits="0" :maxFractionDigits="0" /> 
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key)=='number'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputNumber :id="key" v-model="combinedRecord[key]" showButtons :disabled="isReadOnly(key)" :minFractionDigits="_.get(fieldDefs, [key, 'minFractionDigits'], 0)" :maxFractionDigits="_.get(fieldDefs, [key, 'maxFractionDigits'], 20)" /> 
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key)=='array' && val?.items">
                    <label class="font-bold mb-3 mr-5">{{ getLabel(key) }}</label>
                    <Button icon="pi pi-plus" severity="primary" outlined @click="addNewItemToArray(combinedRecord, key, val.items)" />
                    <!-- Iterate over array items -->
                    <div class="mt-2" v-for="(arrayItem, arrayIndex) in combinedRecord[key]">
                        <div  class="mb-5" v-if="_.get(fieldDefs, [`${key}.*`, 'component'])=='ManyToMany'">
                            <ManyToMany
                                v-model="combinedRecord[key][arrayIndex]"
                                v-bind=" _.get(fieldDefs, [`${key}.*`, 'props'])"
                                :disabled="isReadOnly(key) || (!_.get(fieldDefs, [`${key}.*`, 'canUpdate']) && !_.isEmpty(_.get(combinedRecord[key][arrayIndex], _.get(fieldDefs, [`${key}.*`, 'props', 'variableField']))))"
                            />
                            <Button v-if="_.get(fieldDefs, [`${key}.*`, 'canDelete']) || _.isEmpty(_.get(combinedRecord[key][arrayIndex], _.get(fieldDefs, [`${key}.*`, 'props', 'variableField'])))" class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="record[key].splice(arrayIndex, 1)" />
                        </div>
                        <!-- Check that all array item properties are covered by JSON schema -->
                        <div class="mb-5" v-else-if="val.items.properties && arrayItem && _.isEqual(Object.keys(arrayItem).sort(), Object.keys(val.items.properties).sort())">
                            <template v-for="itemKey in Object.keys(arrayItem)" >
                                <span class="mr-5" v-if="_.get(val.items.properties, [itemKey, 'oneOf'])">
                                    <Select :id="`${itemKey}_${arrayIndex}`" v-model="combinedRecord[key][arrayIndex][itemKey]" :options="_.get(val.items.properties, [itemKey, 'oneOf'])" optionLabel="title" optionValue="const" />
                                </span>
                                <!-- don't display UUID fields, values should not change -->
                                <span class="mr-5" v-else-if="_.get(val.items.properties, [itemKey, 'format']) != 'uuid'">
                                    <InputText :id="`${itemKey}_${arrayIndex}`" v-model="combinedRecord[key][arrayIndex][itemKey]" />
                                </span>
                            </template>
                            <Button class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="combinedRecord[key].splice(arrayIndex, 1)" />
                        </div>
                        <div class="mt-2" v-else-if="val.items.type=='string'">
                            <InputText class="w-80" v-model="combinedRecord[key][arrayIndex]" />
                            <Button class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="combinedRecord[key].splice(arrayIndex, 1)" />
                        </div>
                        <div class="mt-2" v-else-if="val.items.type=='integer'">
                            <InputNumber class="w-80" v-model="combinedRecord[key][arrayIndex]" showButtons :minFractionDigits="0" :maxFractionDigits="0" />
                            <Button class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="combinedRecord[key].splice(arrayIndex, 1)" />
                        </div>
                        <!-- Array properties not covered by JSON schema -->
                        <template v-else=>
                            <InputText class="w-80" disabled v-model="combinedRecord[key][arrayIndex]" />
                        </template>
                    </div>
                </div>
                <div class="mb-5" v-else>
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputText :id="key" v-model="combinedRecord[key]" class="w-80" :disabled="isReadOnly(key)" />
                </div>
            </template>
        </div>
    </div>
</template>
