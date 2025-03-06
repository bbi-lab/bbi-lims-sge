<script setup lang="ts">
import _ from 'lodash'
import { RecordService } from '@/utils/service/RecordService'
import { formatFieldLabel, getFieldType, addNewItemToArray, addErrorsToForm } from '@/utils/formUtils'
import GrommetIconsRevert from '~icons/grommet-icons/revert'

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
const toast = useToast()

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
const previousCombinedRecord = ref<Record<string, any>>({})
const relatedRecords = ref<Record<string, any>>({})
const conflictingValueCounts = ref<Record<string, number>>({})

const inputClasses = computed(() => {
    return _.mapValues(combinedRecord.value, (value, key) => {
        return _.has(conflictingValueCounts.value, key) && value == null ? 'bg-surface-200 dark:bg-gray-800' : ''
    })
})
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
                acc[key] = null
                conflictingValueCounts.value[key] = _.get(conflictingValueCounts, key, 1) + 1
            } else {
                acc[key] = value
            }
        })
        return acc
    }, {})
    dataChanged.value = false
}

watch(() => combinedRecord.value, (newValue, oldValue) => {
    const actualOldValue = _.isEqual(newValue, oldValue) ? previousCombinedRecord.value : oldValue
    previousCombinedRecord.value = JSON.parse(JSON.stringify(newValue))
    
    if (!_.isEqual(newValue, actualOldValue) && newValue?.id == actualOldValue?.id ) {
        // make sure changes are not result of replacing foreign key string values with objects (e.x. using withClause)
        const changes =_.differenceWith(_.toPairs(actualOldValue), _.toPairs(newValue), _.isEqual)
        _.keys(_.fromPairs(changes)).forEach((k) => {
            const oldVal = _.get(actualOldValue, [k, 'id'], actualOldValue?.[k])
            const newVal = _.get(newValue, [k, 'id'], newValue?.[k])
            if (oldVal != newVal) {
                dataChanged.value = true
            }
        })
    }
}, { deep: true })

async function saveRecords() {
    if (props.readOnly) return

    const valuesToUpdate = _.pickBy(combinedRecord.value, (value, key) => {
        return !_.isNull(value) || !_.has(conflictingValueCounts.value, key)
    })
    
    RecordService.updateRecords(apiBaseUrl.value, props.recordIds, valuesToUpdate).then((result: any) => {
        toast.add({ severity: 'success', summary: 'Successful', detail: `${result.length} records updated`, life: 3000 });
        emit('records-update', result)
    }).catch(error => {
        if (_.isArray(error.data?.data)) {
            addErrorsToForm(error.data.data)
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
        }
    })

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
</script>
<template>
    <div class="m-2 w-full flex justify-center">
        <Button class="ml-1" v-tooltip="{value: `${dataChanged ? 'Cancel' : 'Close'}`, showDelay: 1000}" severity="info" :icon="`pi ${dataChanged ? 'pi-undo' : 'pi-times'}`" size="small" @click="cancelEdit" />
        <Button v-if="!readOnly" class="ml-1" v-tooltip="{value: 'Save', showDelay: 1000}" icon="pi pi-save" size="small" :disabled="!dataChanged" @click="saveRecords" />
    </div>
    <div class="pl-8 pb-24 h-full overflow-y-scroll">
        <div v-for="(val, key) in formSchemPropertiesComputed" class="mt-5">
            <template v-if="combinedRecord && key in combinedRecord && _.get(fieldDefs, [key, 'display'])!==false">
                <div class="mb-5" v-if="_.get(fieldDefs, [key, 'component'])=='AutoCompleter'">
                    <label :for="key" class="block font-bold mb-3">{{ _.get(fieldDefs, [key, 'label'], formatFieldLabel(key)) }}</label>
                    <AutoCompleter
                        :input-id="key"
                        :inputClass="inputClasses[key]"
                        v-model="combinedRecord[key]"
                        v-model:obj="relatedRecords[key]"
                        v-bind="_.get(fieldDefs, [key, 'props'])"
                        :placeholder="_.has(conflictingValueCounts, key) ? `${conflictingValueCounts[key]} values` : ''"
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
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='date'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <DatePicker 
                        :id="key"
                        class="w-80"
                        :inputClass="inputClasses[key]"
                        v-model.trim="combinedRecord[key]"
                        showIcon
                        dateFormat="yy-mm-dd"
                        autofocus
                        :placeholder="_.has(conflictingValueCounts, key) ? `${conflictingValueCounts[key]} values` : ''"
                        :disabled="isReadOnly(key)"
                    />
                    <Button icon="pi pi-times" class="ml-2" severity="secondary" outlined @click="combinedRecord[key]=null" />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='date-time'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <DatePicker 
                        :id="key"
                        class="w-80"
                        :inputClass="inputClasses[key]"
                        v-model.trim="combinedRecord[key]" 
                        showTime 
                        showIcon
                        dateFormat="yy-mm-dd"
                        hourFormat="24"
                        autofocus
                        :disabled="isReadOnly(key)"
                        :placeholder="_.has(conflictingValueCounts, key) ? `${conflictingValueCounts[key]} values` : ''"
                    />
                    <Button icon="pi pi-times" class="ml-2" severity="secondary" outlined @click="combinedRecord[key]=null" />
                </div>
                <div class="mb-5" v-else-if="val?.enum">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Select
                        :id="key"
                        :class="inputClasses[key]"
                        v-model="combinedRecord[key]"
                        :options="val.enum"
                        :placeholder="_.has(conflictingValueCounts, key) ? `${conflictingValueCounts[key]} values` : ''"
                        :disabled="isReadOnly(key)"
                    />
                </div>
                <div class="mb-5" v-else-if="val?.oneOf">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Select
                        :id="key"
                        :class="inputClasses[key]"
                        v-model="combinedRecord[key]"
                        :options="val.oneOf" optionLabel="title"
                        optionValue="const"
                        :placeholder="_.has(conflictingValueCounts, key) ? `${conflictingValueCounts[key]} values` : ''"
                        :disabled="isReadOnly(key)"
                    />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='boolean'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Checkbox
                        :id="key"
                        :pt="_.has(conflictingValueCounts, key) && combinedRecord[key] == null ? { box: { class: 'bg-surface-200 dark:bg-gray-800' } } : {}"
                        v-model="combinedRecord[key]"
                        :binary="true"
                        :disabled="isReadOnly(key)"
                    />
                    <Button v-if="_.has(conflictingValueCounts, key) && combinedRecord[key] != null" icon="pi pi-times" class="ml-2" severity="secondary" outlined @click="combinedRecord[key]=null" />
                    <span v-if="_.has(conflictingValueCounts, key) && combinedRecord[key] == null" class="pl-3">{{_.has(conflictingValueCounts, key) ? `${conflictingValueCounts[key]} values` : ''}}</span>
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='integer'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputNumber
                        :id="key"
                        :inputClass="inputClasses[key]"
                        v-model="combinedRecord[key]"
                        showButtons
                        :placeholder="_.has(conflictingValueCounts, key) ? `${conflictingValueCounts[key]} values` : ''"
                        :disabled="isReadOnly(key)"
                        :minFractionDigits="0"
                        :maxFractionDigits="0"
                    />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='number'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputNumber
                        :id="key"
                        :inputClass="inputClasses[key]"
                        v-model="combinedRecord[key]"
                        showButtons :disabled="isReadOnly(key)"
                        :placeholder="_.has(conflictingValueCounts, key) ? `${conflictingValueCounts[key]} values` : ''"
                        :minFractionDigits="_.get(fieldDefs, [key, 'minFractionDigits'], 0)"
                        :maxFractionDigits="_.get(fieldDefs, [key, 'maxFractionDigits'], 20)"
                    />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='array' && val?.items">
                    <div class="flex items-start">
                        <label class="font-bold mb-3 mr-5">{{ getLabel(key) }}</label>
                        <Button v-if="(_.has(conflictingValueCounts, key) && combinedRecord[key]!=null) || !_.has(conflictingValueCounts, key)" tooltip="Add value" icon="pi pi-plus" class="ml-2" severity="primary" outlined @click="addNewItemToArray(combinedRecord, key, val.items)" />
                        <Button v-if="_.has(conflictingValueCounts, key) && combinedRecord[key]!=null" tooltip="Revert values" outlined severity="info" class="ml-2" @click="combinedRecord[key]=null">
                            <template #icon>
                                <GrommetIconsRevert />
                            </template>
                        </Button>
                        </div>
                    <div class="group">
                        <span v-if="_.has(conflictingValueCounts, key) && combinedRecord[key] == null" class="pl-3">{{_.has(conflictingValueCounts, key) ? `${conflictingValueCounts[key]} sets of values` : ''}}</span>
                        <span v-else-if="_.isEmpty(combinedRecord[key])" class="pl-3">No values</span>

                        <Button v-if="_.has(conflictingValueCounts, key) && combinedRecord[key]==null" tooltip="Overwrite values" icon="pi pi-pencil" class="ml-2" severity="primary" outlined @click="addNewItemToArray(combinedRecord, key, val.items)" />
                    </div>

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
                    <!-- <InputText v-if="_.has(combinedRecord[key], '__conflictingValues')" :id="key" @focusin="handleFocusIn" @focusout="handleFocusOut" :placeholder="`${combinedRecord[key]['__conflictingValues']} values`" class="w-80" :disabled="isReadOnly(key)" /> -->
                    <InputText
                        :id="key"
                        v-model="combinedRecord[key]"
                        :class="`w-80 ${inputClasses[key]}`"
                        :disabled="isReadOnly(key)"
                        :placeholder="_.has(conflictingValueCounts, key) ? `${conflictingValueCounts[key]} values` : ''"
                    />
                </div>
            </template>
        </div>
    </div>
    <ConfirmPopup></ConfirmPopup>
</template>
