<script setup lang="ts">
import _ from 'lodash'
import { RecordService } from '@/utils/service/RecordService'
import { TransfectionExperiment } from '~/shared/sge/transfection-experiment'
import { formatFieldLabel, getFieldType, addNewItemToArray, addErrorsToForm } from '@/utils/formUtils'

const config = useRuntimeConfig()
const confirmPopup = useConfirm()
const toast = useToast()

const apiBaseUrl = computed(() => `${config.public.apiBase}/${props.tableName}`)
const schemasUrl = computed(() => `${config.public.apiBase}/schemas/${props.tableName}`)
const formSchemPropertiesComputed = computed(() => _.mapValues(formSchema.value?.properties || {}, (x) => x.anyOf ? _.find(x.anyOf, (x) => x.type != 'null') : x))

const props = defineProps({
  recordId: String,
  tableName: String,
  schemaName: {type:String, required: true},
  readOnly: {type: Boolean, default: false},
  withClause: {type: Object},
  canDelete: {type: Boolean, default: true},
  fieldDefs: {type: Object},                 // to override widgets/labels for individual fields
  readonlyValues: {type: Object},             // to set values for and lock fields on form
  values: {type: Object},
})

const refreshForm = async function() {
    if (props.recordId) {
        formSchema.value = await RecordService.getSchema(schemasUrl.value, props.schemaName, props.recordId)
        record.value = await RecordService.getRecord(apiBaseUrl.value, props.recordId, props.withClause)
    } else {
        formSchema.value = await RecordService.getSchema(schemasUrl.value, props.schemaName)
        record.value = _.mapValues(formSchema.value?.properties, (x) => null)
    }
    if (props.readonlyValues) {
        _.assign(record.value, props.readonlyValues)
    }
    dataChanged.value = false
    if (props.values) {
        _.assign(record.value, props.values)
        dataChanged.value = true
    }
}

const emit = defineEmits([
    'record-update',
    'record-add',
    'record-delete',
    'cancel'
])

const formSchema = ref<FormSchema>()
const formElement = ref<HTMLElement | null>(null)
const record = ref()
const relatedRecords = ref<Record<string, any>>({})
const dataChanged = ref(false)
const discardConfirmed = ref(false)
const displayDeleteConfirmation = ref(false)
const displayDiscardConfirmation = ref(false)

onMounted(() => refreshForm())

watch(() => props.recordId, (newValue, oldValue) => {
  if (newValue != oldValue ) {
    if (dataChanged.value) {
        displayDiscardConfirmation.value = true
    } else {
        refreshForm()
    }
  }
})

// watching cloned record for changes to prevent issue where newValue and oldValue are equal
// https://vuejs.org/guide/essentials/watchers.html#deep-watchers
const recordClone = computed(() => _.cloneDeep(record.value))
watch(() => recordClone.value, (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue) && newValue?.id == oldValue?.id ) {
        // make sure changes are not result of replacing foreign key string values with objects (e.x. using withClause)
        const changes =_.differenceWith(_.toPairs(oldValue), _.toPairs(newValue), _.isEqual)
        _.keys(_.fromPairs(changes)).forEach((k) => {
            const oldVal = _.get(oldValue, [k, 'id'], oldValue?.[k])
            const newVal = _.get(newValue, [k, 'id'], newValue?.[k])
            if (oldVal != newVal) {
                dataChanged.value = true
            }
        })
    }
}, { deep: true })

function deleteRecord() {
    if (_.has(record.value, 'id')) {
        RecordService.deleteRecord(apiBaseUrl.value, record.value.id).then((result) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Record deleted', life: 3000 })
            emit('record-delete', result)
        }).catch(error => {
            toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
        })
    }
    displayDeleteConfirmation.value = false
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

function showDeleteConfirmation() {
    displayDeleteConfirmation.value = true
}
function getLabel(key: string) {
    const label = _.get(props.fieldDefs, [key, 'label'])
    if (_.isFunction(label)) {
        return label(_.cloneDeep(record.value), _.cloneDeep(relatedRecords.value))
    } else if (label) {
        return label
    } else {
        return _.get(props.fieldDefs, [`${key}.*`, 'label'], formatFieldLabel(key))
    }
}
async function saveRecord() {
    if (props.readOnly) return

    if (_.has(record.value, 'id') && record.value.id && formSchema.value) {
        // updating single record - limit to properties in JSON schema
        const values = {id: _.get(record.value, 'id'), ..._.pick(record.value,  Object.keys(formSchema.value.properties))}
        RecordService.updateRecord(apiBaseUrl.value, values).then((result) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Record updated', life: 3000 });
            emit('record-update', result)
        }).catch(error => {
            if (formElement.value && _.isArray(error.data?.data)) {
                addErrorsToForm(formElement.value, error.data.data)
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
            }
        })
    } else if (!props.recordId && formSchema.value) {
        // new record
        const values = _.pick(record.value, Object.keys(formSchema.value.properties))

        // TODO - Two methods are available, either using a custom class or generic service. The use of custom classes with this component
        // can likely be made dynamic in the future if underlying classes are defined consistently with 2 properties: id (primary key) and data (everything else).
        if (props.tableName=='transfect-experiments') {
            const newExperiment = new TransfectionExperiment({
                name: values.name || null,
                technician: values.technician || null,
                startedOn: values.startedOn || new Date(),
                transfectionCount: values.transfectionCount || null,
                replicateCount: values.replicateCount || null
            })
            const result = await newExperiment.create()
            if (result && result.success) {
                emit('record-add', {id: newExperiment.id, ...newExperiment.data})
            }
        } else {
            RecordService.addRecord(apiBaseUrl.value, values).then((result) => {
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Record added', life: 3000 });
                emit('record-add', result)
            }).catch(error => {
                if (formElement.value && _.isArray(error.data?.data)) {
                    addErrorsToForm(formElement.value, error.data.data)
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
                }
            })
        }
    }
}
function isReadOnly(key: string) {
    return props.readOnly ? true : _.has(props.readonlyValues, key) || _.get(props.fieldDefs, [key, 'readOnly'], false)
}
</script>
<template>
    <div class="m-2 w-full flex justify-center">
        <Button class="ml-1" v-tooltip="{value: `${dataChanged ? 'Cancel' : 'Close'}`}" severity="info" :icon="`pi ${dataChanged ? 'pi-undo' : 'pi-times'}`" size="small" @click="cancelEdit" />
        <Button v-if="!readOnly" class="ml-1" v-tooltip="{value: 'Save'}" icon="pi pi-save" size="small" :disabled="!dataChanged" @click="saveRecord" />
        <Button v-if="canDelete && recordId" class="ml-1" v-tooltip="{value: 'Delete'}" icon="pi pi-trash" size="small" severity="danger" style="width: auto" @click="showDeleteConfirmation" />
    </div>
    <div ref="formElement" class="pl-8 pb-24 h-full overflow-y-scroll">
        <div v-for="(val, key) in formSchemPropertiesComputed" class="mt-5">
            <template v-if="record && key in record && _.get(fieldDefs, [key, 'display'])!==false">
                <div class="mb-5" v-if="_.get(fieldDefs, [key, 'component'])=='AutoCompleter'">
                    <label :for="key" class="block font-bold mb-3">{{ _.get(fieldDefs, [key, 'label'], formatFieldLabel(key)) }}</label>
                    <AutoCompleter
                        :input-id="key"
                        v-model="record[key]"
                        v-model:obj="relatedRecords[key]"
                        v-bind="_.get(fieldDefs, [key, 'props'])"
                        :disabled="isReadOnly(key)"
                    />
                </div>
                <div class="mb-5" v-else-if="_.get(fieldDefs, [key, 'component'])=='NestedSelect'">
                    <label :for="key" class="block font-bold mb-3">{{ _.get(fieldDefs, [key, 'label'], formatFieldLabel(key)) }}</label>
                    <NestedSelect
                        :input-id="key"
                        v-model="record[key]"
                        v-bind="_.get(fieldDefs, [key, 'props'])"
                        :disabled="isReadOnly(key)"
                    />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='date'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <DatePicker
                        class="w-80"
                        :id="key"
                        v-model.trim="record[key]"
                        showIcon
                        dateFormat="yy-mm-dd"
                        autofocus
                        :disabled="isReadOnly(key)"
                    />
                    <Button icon="pi pi-times" class="ml-2" severity="secondary" outlined @click="record[key]=null" />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='date-time'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <DatePicker
                        class="w-80"
                        :id="key"
                        v-model.trim="record[key]"
                        showTime
                        showIcon
                        dateFormat="yy-mm-dd"
                        hourFormat="24"
                        autofocus
                        :disabled="isReadOnly(key)"
                    />
                    <Button icon="pi pi-times" class="ml-2" severity="secondary" outlined @click="record[key]=null" />
                </div>
                <div class="mb-5" v-else-if="val?.enum">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Select :id="key" v-model="record[key]" :options="val.enum" :disabled="isReadOnly(key)" />
                </div>
                <div class="mb-5" v-else-if="val?.oneOf">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Select :id="key" v-model="record[key]" :options="val.oneOf" optionLabel="title" optionValue="const" :disabled="isReadOnly(key)"/>
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='boolean'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Checkbox :id="key" v-model="record[key]" :binary="true" :disabled="isReadOnly(key)" />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='integer'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputNumber :id="key" v-model="record[key]" showButtons :disabled="isReadOnly(key)" :minFractionDigits="0" :maxFractionDigits="0" />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='number'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputNumber :id="key" v-model="record[key]" showButtons :disabled="isReadOnly(key)" :minFractionDigits="_.get(fieldDefs, [key, 'minFractionDigits'], 0)" :maxFractionDigits="_.get(fieldDefs, [key, 'maxFractionDigits'], 20)" />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key, fieldDefs)=='array' && val?.items">
                    <label class="font-bold mb-3 mr-5">{{ getLabel(key) }}</label>
                    <Button icon="pi pi-plus" severity="primary" outlined @click="addNewItemToArray(record, key, val.items)" />
                    <!-- Iterate over array items -->
                    <div class="mt-2" v-for="(arrayItem, arrayIndex) in record[key]">
                        <div  class="mb-5" v-if="_.get(fieldDefs, [`${key}.*`, 'component'])=='ManyToMany'">
                            <ManyToMany
                                v-model="record[key][arrayIndex]"
                                v-bind=" _.get(fieldDefs, [`${key}.*`, 'props'])"
                                :disabled="isReadOnly(key) || (!_.get(fieldDefs, [`${key}.*`, 'canUpdate']) && !_.isEmpty(_.get(record[key][arrayIndex], _.get(fieldDefs, [`${key}.*`, 'props', 'variableField']))))"
                            />
                            <Button v-if="_.get(fieldDefs, [`${key}.*`, 'canDelete']) || _.isEmpty(_.get(record[key][arrayIndex], _.get(fieldDefs, [`${key}.*`, 'props', 'variableField'])))" class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="record[key].splice(arrayIndex, 1)" />
                        </div>
                        <!-- Check that all array item properties are covered by JSON schema -->
                        <div class="mb-5" v-else-if="val.items.properties && arrayItem && _.isEqual(Object.keys(arrayItem).sort(), Object.keys(val.items.properties).sort())">
                            <template v-for="itemKey in Object.keys(arrayItem)" >
                                <span class="mr-5" v-if="_.get(val.items.properties, [itemKey, 'oneOf'])">
                                    <Select :id="`${itemKey}_${arrayIndex}`" v-model="record[key][arrayIndex][itemKey]" :options="_.get(val.items.properties, [itemKey, 'oneOf'])" optionLabel="title" optionValue="const" />
                                </span>
                                <!-- don't display UUID fields, values should not change -->
                                <span class="mr-5" v-else-if="_.get(val.items.properties, [itemKey, 'format']) != 'uuid'">
                                    <InputText :id="`${itemKey}_${arrayIndex}`" v-model="record[key][arrayIndex][itemKey]" />
                                </span>
                            </template>
                            <Button class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="record[key].splice(arrayIndex, 1)" />
                        </div>
                        <div class="mt-2" v-else-if="val.items.type=='string'">
                            <div class="flex items-start quickform-input-wrapper">
                                <InputText :id="`${key}_${arrayIndex}`" class="w-80" v-model="record[key][arrayIndex]" />
                                <Button class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="record[key].splice(arrayIndex, 1)" />
                            </div>
                        </div>
                        <div class="mt-2" v-else-if="val.items.type=='integer'">
                            <div class="flex items-start quickform-input-wrapper">
                                <InputNumber :id="`${key}_${arrayIndex}`" class="w-80" v-model="record[key][arrayIndex]" showButtons :minFractionDigits="0" :maxFractionDigits="0" />
                                <Button class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="record[key].splice(arrayIndex, 1)" />
                            </div>
                        </div>
                        <!-- Array properties not covered by JSON schema -->
                        <template v-else=>
                            <InputText class="w-80" disabled v-model="record[key][arrayIndex]" />
                        </template>
                    </div>
                </div>
                <div class="mb-5" v-else>
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputText :id="key" v-model="record[key]" class="w-80" :disabled="isReadOnly(key)" />
                    <a v-if="getFieldType(val, key, fieldDefs)=='hyperlink' && !_.isEmpty(record[key])" :href="record[key]" target="_blank">
                        <Button class="ml-2" icon="pi pi-external-link" variant="text" severity="info" />
                    </a>
                </div>
            </template>
        </div>
    </div>
    <Dialog header="Unsaved changes" v-model:visible="displayDiscardConfirmation" :style="{ width: '350px' }" :modal="true">
        <div class="flex items-center justify-center">
            <i class="pi pi-exclamation-triangle mr-4" style="font-size: 2rem" />
            <span>Discard changes without saving?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" @click="displayDiscardConfirmation=!displayDiscardConfirmation" text severity="secondary" />
            <Button label="Yes" icon="pi pi-check" @click="discardConfirmed=true" severity="danger" outlined autofocus />
        </template>
    </Dialog>
    <Dialog header="Confirmation" v-model:visible="displayDeleteConfirmation" :style="{ width: '350px' }" :modal="true">
        <div class="flex items-center justify-center">
            <i class="pi pi-exclamation-triangle mr-4" style="font-size: 2rem" />
            <span>Are you sure you want to proceed?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" @click="displayDeleteConfirmation=!displayDeleteConfirmation" text severity="secondary" />
            <Button label="Yes" icon="pi pi-check" @click="deleteRecord" severity="danger" outlined autofocus />
        </template>
    </Dialog>
    <ConfirmPopup></ConfirmPopup>
</template>
