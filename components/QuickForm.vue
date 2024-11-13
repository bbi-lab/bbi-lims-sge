<script setup>
import _ from 'lodash'
import { RecordService } from '@/utils/service/RecordService'

const config = useRuntimeConfig()
const apiBaseUrl = computed(() => `${config.public.apiBase}/${props.tableName}`)
const schemasUrl = computed(() => `${config.public.apiBase}/schemas/${props.tableName}`)

onMounted(async () => {
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
})

const props = defineProps({
  recordId: String,
  tableName: String,
  schemaName: String,
  withClause: {type: Object},
  canDelete: {type: Boolean, default: true},
  fieldDefs: {type: Object},                 // to override widgets/labels for individual fields
  defaultValues: {type: Object},             // to hide fields on form, and set defaults for new records
})

const emit = defineEmits([
    'record-update',
    'record-add',
    'record-delete',
    'cancel'
])

const toast = useToast()
const formSchema = ref()
const record = ref(null)
const displayDeleteConfirmation = ref(false)

function deleteRecord() {
    if (_.has(record.value, 'id')) {
        RecordService.deleteRecord(apiBaseUrl.value, record.value.id).then((result) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Record deleted', life: 3000 })
            emit('record-delete', result)
        })
    }
    displayDeleteConfirmation.value = false
}

function showDeleteConfirmation() {
    displayDeleteConfirmation.value = true
}
function getLabel(key) {
    return _.get(props.fieldDefs, [key, 'label'], _.startCase(key))
}
function saveRecord() {
    if (_.has(record.value, 'id')) {
        // updating single record - limit to properties in JSON schema
        const values = {id: _.get(record.value, 'id'), ..._.pick(record.value,  Object.keys(formSchema.value?.properties))}
        RecordService.updateRecord(apiBaseUrl.value, values).then((result) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Record updated', life: 3000 });
            emit('record-update', result)
        }).catch(error => {
            // TODO - when possible, show errors next to the field(s) that failed validation
            toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
        })
    } else if (!props.recordId) {
        // new record
        const values = _.pick(record.value, Object.keys(formSchema.value?.properties))
        RecordService.addRecord(apiBaseUrl.value, values).then((result) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Record added', life: 3000 });
            emit('record-add', result)
        }).catch(error => {
            // TODO - when possible, show errors next to the field(s) that failed validation
            toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
        })
    }
}
function addNewItemToArray(array, itemProperties) {
    const newItem = {}
    for (const [k,v] of Object.entries(itemProperties)) {
        // default value for foreign key should be set in JSON schema based on props.recordId 
        if (v.default) {
            _.set(newItem, k, v.default)
        } else {
            _.set(newItem, k, null)
        }
    }
    array.push(newItem)
}
</script>
<template>
    <!-- repeat the form buttons at the top and bottom if there are 5 or more properties -->
    <template v-for="n in 2">
        <div v-if="n==2 || (n<=1 && _.keys(formSchema?.properties).length > 5)">
            <Button class="m-1" label="Cancel" icon="pi pi-times" text @click="emit('cancel')" />
            <Button class="m-1" label="Save" icon="pi pi-check" @click="saveRecord" />
            <Button v-if="canDelete" label="Delete" icon="pi pi-trash" severity="danger" style="width: auto" @click="showDeleteConfirmation" />
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
        </div>
        <div v-if="n==1" v-for="(val, key, index) in formSchema?.properties">
            <template v-if="record && key in record && !_.has(defaultValues, key)">
                <div class="mb-5" v-if="_.get(fieldDefs, [key, 'component'])=='AutoCompleter'">
                    <label :for="key" class="block font-bold mb-3">{{ _.get(fieldDefs, [key, 'label'], _.startCase(key)) }}</label>
                    <AutoCompleter 
                        v-model="record[key]"
                        v-bind="_.get(fieldDefs, [key, 'props'])"
                    />
                </div>
                <div class="mb-5" v-else-if="val.format=='date-time' || val.anyOf?.[0]?.format=='date-time'">
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
                    />
                    <Button icon="pi pi-times" severity="secondary" outlined @click="record[key]=null" />
                </div>
                <div class="mb-5" v-else-if="val.enum">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Select :id="key" v-model="record[key]" :options="val.enum" />
                </div>
                <div class="mb-5" v-else-if="val.oneOf">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Select :id="key" v-model="record[key]" :options="val.oneOf" optionLabel="title" optionValue="const" />
                </div>
                <div class="mb-5" v-else-if="val.type=='boolean'">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <Checkbox :id="key" v-model="record[key]" :binary="true" />
                </div>
                <div class="mb-5" v-else-if="val.type=='array'">
                    <label class="font-bold mb-3 mr-5">{{ getLabel(key) }}</label>
                    <Button icon="pi pi-plus" severity="primary" outlined @click="addNewItemToArray(record[key], val.items.properties)" />
                    <!-- Iterate over array items -->
                    <template v-for="(arrayItem, arrayIndex) in record[key]">
                        <!-- Check that all array item properties are covered by JSON schema -->
                        <div class="mb-5" v-if="arrayItem && _.isEqual(Object.keys(arrayItem).sort(), Object.keys(val.items.properties).sort())">
                            <template v-for="itemKey in Object.keys(arrayItem)" >
                                <span class="mr-5" v-if="val.items.properties[itemKey].oneOf">
                                    <Select :id="`${itemKey}_${arrayIndex}`" v-model="record[key][arrayIndex][itemKey]" :options="val.items.properties[itemKey].oneOf" optionLabel="title" optionValue="const" />
                                </span>
                                <!-- don't display UUID fields, values should not change -->
                                <span class="mr-5" v-else-if="val.items.properties[itemKey].format!='uuid'">
                                    <InputText :id="`${itemKey}_${arrayIndex}`" v-model="record[key][arrayIndex][itemKey]" />
                                </span>
                            </template>
                            <Button icon="pi pi-times" severity="secondary" outlined @click="record[key].splice(arrayIndex, 1)" />
                        </div>
                        <!-- Array properties not covered by JSON schema -->
                        <template v-else-if="record[key][arrayKey]">
                            <InputText disabled v-model="record[key][arrayKey]" />
                        </template>
                    </template>
                </div>
                <div class="mb-5" v-else-if="val.type=='number' || _.isEqual(val.type, ['number', 'null'])">
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputNumber :id="key" v-model="record[key]" showButtons />
                </div>
                <div class="mb-5" v-else>
                    <label :for="key" class="block font-bold mb-3">{{ getLabel(key) }}</label>
                    <InputText :id="key" v-model="record[key]" />
                </div>
            </template>
        </div>
        
    </template>
    
</template>
