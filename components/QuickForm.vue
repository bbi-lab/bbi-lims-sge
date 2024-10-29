<script setup>
import _ from 'lodash'
import { RecordService } from '@/utils/service/RecordService'

onMounted(async () => {
    formSchema.value = await RecordService.getSchema(props.apiBaseUrl, props.schemaName)
    
    if (props.recordId) {
        record.value = await RecordService.getRecord(props.apiBaseUrl, props.recordId)
    } else {
        record.value = _.mapValues(formSchema.value?.properties || [], (x) => null)
    }
})

const props = defineProps({
  recordId: String,
  apiBaseUrl: String,
  schemaName: String,
})

const toast = useToast()
const formSchema = ref()
const record = ref(null)
const emit = defineEmits(['record-update', 'record-add', 'record-delete', 'cancel'])
const displayDeleteConfirmation = ref(false)

function deleteRecord() {
    if (_.has(record.value, 'id')) {
        RecordService.deleteRecord(props.apiBaseUrl, record.value.id).then((result) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Record deleted', life: 3000 })
            emit('record-delete', result)
        })
    }
    displayDeleteConfirmation.value = false
}

function showDeleteConfirmation() {
    displayDeleteConfirmation.value = true
}
function saveRecord() {
    if (_.has(record.value, 'id')) {
        // updating single record - limit to properties in JSON schema
        const values = {id: _.get(record.value, 'id'), ..._.pick(record.value,  Object.keys(formSchema.value?.properties))}
        RecordService.updateRecord(props.apiBaseUrl, values).then((result) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Record updated', life: 3000 });
            emit('record-update', result)
        })
    } else if (!props.recordId) {
        // new record
        const values = _.pick(record.value, Object.keys(formSchema.value?.properties))
        RecordService.addRecord(props.apiBaseUrl, values).then((result) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Record added', life: 3000 });
            emit('record-add', result)
        })
    }
}
</script>
<template>
    <div v-for="(val, key, index) in formSchema?.properties">
        <template v-if="record && key in record">
            <div class="mb-5" v-if="val.format=='date-time' || val.anyOf?.[0]?.format=='date-time'">
                <label :for="key" class="block font-bold mb-3">{{ key }}</label>
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
                <label :for="key" class="block font-bold mb-3">{{ key }}</label>
                <Select :id="key" v-model="record[key]" :options="val.enum" />
            </div>
            <div class="mb-5" v-else-if="val.oneOf">
                <label :for="key" class="block font-bold mb-3">{{ key }}</label>
                <Select :id="key" v-model="record[key]" :options="val.oneOf" optionLabel="title" optionValue="const" />
            </div>
            <div class="mb-5" v-else>
                <label :for="key" class="block font-bold mb-3">{{ key }}</label>
                <InputText :id="key" v-model="record[key]" />
            </div>
        </template>
    </div>
    <div>
        <Button class="m-1" label="Cancel" icon="pi pi-times" text @click="emit('cancel')" />
        <Button class="m-1" label="Save" icon="pi pi-check" @click="saveRecord" />
        <Button label="Delete" icon="pi pi-trash" severity="danger" style="width: auto" @click="showDeleteConfirmation" />
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
    
</template>
