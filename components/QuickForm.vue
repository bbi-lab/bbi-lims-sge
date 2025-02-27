<script setup>
import _ from 'lodash'
import { RecordService } from '@/utils/service/RecordService'
import { TransfectionExperiment } from '~/shared/sge/transfection-experiment'

const config = useRuntimeConfig()
const confirmPopup = useConfirm()

const apiBaseUrl = computed(() => `${config.public.apiBase}/${props.tableName}`)
const schemasUrl = computed(() => `${config.public.apiBase}/schemas/${props.tableName}`)

const props = defineProps({
  recordId: String,
  tableName: String,
  schemaName: String,
  readOnly: {type: Boolean, default: false},
  withClause: {type: Object},
  canDelete: {type: Boolean, default: true},
  fieldDefs: {type: Object},                 // to override widgets/labels for individual fields
  defaultValues: {type: Object},             // to hide fields on form, and set defaults for new records
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
    if (props.defaultValues) {
        _.assign(record.value, props.defaultValues)
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

const toast = useToast()
const formSchema = ref()
const record = ref(null)
const relatedRecords = ref({})
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

function addErrorsToForm(formErrors) {
    // remove any previous validation errors
    document.querySelectorAll('.lims-validation-error').forEach((x) => x.remove())
    
    // remove red outline from inputs
    const existingErrorsInputs = document.querySelectorAll('.lims-validation-error-input')
    existingErrorsInputs.forEach((x) => {
        x.classList.remove('lims-validation-error-input', 'border-red-500')
    })

    // add error text and styling
    for (const e of formErrors) {
        const elementId = e.path?.[0]
        const element = document.getElementById(elementId)

        // get input element
        let inputElement
        if (element.tagName == 'INPUT') {
            inputElement = element
        } else {
            inputElement = element.querySelector('input')
        }

        if (inputElement) {
            inputElement.classList.add('lims-validation-error-input', '!border-red-500')
            const errorMsg = document.createElement('div')
            errorMsg.setAttribute('class', 'lims-validation-error text-red-500')
            errorMsg.textContent = e.message
            element.after(errorMsg)
        }
    }
}

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

function cancelEdit(event) {
    if (dataChanged.value) {
        confirmPopup.require({
            target: event.target,
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
function getLabel(key) {
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
    if (_.has(record.value, 'id') && record.value.id) {
        // updating single record - limit to properties in JSON schema
        const values = {id: _.get(record.value, 'id'), ..._.pick(record.value,  Object.keys(formSchema.value?.properties))}
        RecordService.updateRecord(apiBaseUrl.value, values).then((result) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Record updated', life: 3000 });
            emit('record-update', result)
        }).catch(error => {
            if (_.isArray(error.data?.data)) {
                addErrorsToForm(error.data.data)
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
            }
        })
    } else if (!props.recordId) {
        // new record
        const values = _.pick(record.value, Object.keys(formSchema.value?.properties))

        // TODO - Two methods are available, either using a custom class or generic service. The use of custom classes with this component
        // can likely be dynamic if underlying classes are defined consistently with 2 properties: id (primary key) and data (everything else).
        if (props.tableName=='transfect-experiments') {
            const newExperiment = new TransfectionExperiment(values)
            const result = await newExperiment.create()
            if (result.success) {
                emit('record-add', {id: newExperiment.id, ...newExperiment.data})
            }
        } else {
            RecordService.addRecord(apiBaseUrl.value, values).then((result) => {
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Record added', life: 3000 });
                emit('record-add', result)
            }).catch(error => {
                if (_.isArray(error.data?.data)) {
                    addErrorsToForm(error.data.data)
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
                }    
            })
        }
    }
}
function addNewItemToArray(record, key, schemaItems) {
    if (!_.isArray(record[key])) record[key] = []

    if (schemaItems.properties) {
        const newItem = {}
        for (const [k,v] of Object.entries(schemaItems.properties)) {
            // default value for foreign key should be set in JSON schema based on props.recordId 
            if (v.default) {
                _.set(newItem, k, v.default)
            } else {
                _.set(newItem, k, null)
            }
        }
        record[key].push(newItem)
    } else if (schemaItems.type == 'string') {
        record[key].push('')
    } else if (schemaItems.type == 'integer') {
        record[key].push(null)
    }
}
function isReadOnly(key) {
    return props.readOnly ? true : _.has(props.defaultValues, key) || _.get(props.fieldDefs, [key, 'readOnly'], false)
}

function getFieldType(val, key) {
    const fieldType = _.get(props.fieldDefs, [key, 'type'])
    if (fieldType) {
        return fieldType
    } else if (_.isArray(val.type) && _.includes(val.type, 'null') && val.type.length == 2) {
        // getting field type for nullable fields
        return _.find(val.type, (x) => x != 'null')
    } else if (val.format=='date-time' || val.anyOf?.[0]?.format=='date-time') {
        return 'date-time'
    } else {
        // no field type defined
        return val.type
    }
}
</script>
<template>
    <div class="m-2 w-full flex justify-center">
        <Button class="ml-1" v-tooltip="{value: `${dataChanged ? 'Cancel' : 'Close'}`, showDelay: 1000}" severity="info" :icon="`pi ${dataChanged ? 'pi-undo' : 'pi-times'}`" size="small" @click="cancelEdit" />
        <Button v-if="!readOnly" class="ml-1" v-tooltip="{value: 'Save', showDelay: 1000}" icon="pi pi-save" size="small" :disabled="!dataChanged" @click="saveRecord" />
        <Button v-if="canDelete" class="ml-1" v-tooltip="{value: 'Delete', showDelay: 1000}" icon="pi pi-trash" size="small" severity="danger" style="width: auto" @click="showDeleteConfirmation" />
    </div>
    <div class="pl-8 pb-24 h-full overflow-y-scroll">
        <div
            v-for="(val, key, index) in formSchema?.properties" 
            class="mt-5"
            :set="val = val.anyOf ? _.find(val.anyOf, (x) => x.type != 'null') : val"
        >
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
                <div class="mb-5" v-else-if="getFieldType(val, key)=='date-time'">
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
                <div class="mb-5" v-else-if="val.enum">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Select :id="key" v-model="record[key]" :options="val.enum" :disabled="isReadOnly(key)" />
                </div>
                <div class="mb-5" v-else-if="val.oneOf">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Select :id="key" v-model="record[key]" :options="val.oneOf" optionLabel="title" optionValue="const" :disabled="isReadOnly(key)"/>
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key)=='boolean'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Checkbox :id="key" v-model="record[key]" :binary="true" :disabled="isReadOnly(key)" />
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key)=='integer'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputNumber :id="key" v-model="record[key]" showButtons :disabled="isReadOnly(key)" :minFractionDigits="0" :maxFractionDigits="0" /> 
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key)=='number'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputNumber :id="key" v-model="record[key]" showButtons :disabled="isReadOnly(key)" :minFractionDigits="_.get(fieldDefs, [key, 'minFractionDigits'], 0)" :maxFractionDigits="_.get(fieldDefs, [key, 'maxFractionDigits'], 20)" /> 
                </div>
                <div class="mb-5" v-else-if="getFieldType(val, key)=='array'">
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
                                <span class="mr-5" v-if="val.items.properties[itemKey].oneOf">
                                    <Select :id="`${itemKey}_${arrayIndex}`" v-model="record[key][arrayIndex][itemKey]" :options="val.items.properties[itemKey].oneOf" optionLabel="title" optionValue="const" />
                                </span>
                                <!-- don't display UUID fields, values should not change -->
                                <span class="mr-5" v-else-if="val.items.properties[itemKey].format!='uuid'">
                                    <InputText :id="`${itemKey}_${arrayIndex}`" v-model="record[key][arrayIndex][itemKey]" />
                                </span>
                            </template>
                            <Button class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="record[key].splice(arrayIndex, 1)" />
                        </div>
                        <div class="mt-2" v-else-if="val.items.type=='string'">
                            <InputText class="w-80" v-model="record[key][arrayIndex]" />
                            <Button class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="record[key].splice(arrayIndex, 1)" />
                        </div>
                        <div class="mt-2" v-else-if="val.items.type=='integer'">
                            <InputNumber class="w-80" v-model="record[key][arrayIndex]" showButtons :minFractionDigits="0" :maxFractionDigits="0" />
                            <Button class="ml-2" icon="pi pi-times" severity="secondary" outlined @click="record[key].splice(arrayIndex, 1)" />
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
            <Button label="Yes" icon="pi pi-check" @click="discardConfirmed" severity="danger" outlined autofocus />
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
