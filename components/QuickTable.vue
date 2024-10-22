<script setup>
import _ from 'lodash'
import { FilterMatchMode } from '@primevue/core/api'
import { RecordService } from '@/utils/service/RecordService'

onMounted(async() => {
    tableSchema.value = await RecordService.getSchema(props.apiBaseUrl, props.schemaName)
    records.value = await RecordService.getRecords(props.apiBaseUrl)
})

const props = defineProps({
  apiBaseUrl: String,
  schemaName: String,
  title: String,
})
const emit = defineEmits([
    'clicked-record-edit',
    'clicked-record-delete',
    'clicked-record-add',
    'clicked-multi-delete'
])

const records = ref([])
const selectedRecords = ref([])
const tableSchema = ref()
const dt = ref()

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

function formatDate(value) {
    const date = value ? new Date(value) : null
    return date ? date.toISOString().split('T')[0] : ''
}

function didClickEditRecord(event) {
    emit('clicked-record-edit', event)
}
function didClickDeleteRecord(event) {
    emit('clicked-record-delete', event)
}
function didClickAddRecord(event) {
    emit('clicked-record-add', event)
}
function exportCSV() {
    dt.value.exportCSV()
}

const addOrRefreshRecordId = async (recordId) => {
    const currentRecord = await RecordService.getRecord(props.apiBaseUrl, recordId)
    const existingRecordIndex = _.findIndex(records.value, {id: recordId})
    console.log(existingRecordIndex)
    if (existingRecordIndex!=-1) {
        records.value[existingRecordIndex] = currentRecord
    } else {
        records.value = _.concat(records.value, currentRecord)
    }
}

const removeRecordId = (recordId) => {
    records.value = _.reject(records.value, {id: recordId})
}

defineExpose({ addOrRefreshRecordId, removeRecordId })

</script>

<template>
    <DataTable
        ref="dt"
        v-model:selection="selectedRecords"
        :value="records"
        dataKey="id"
        scrollable 
        scrollHeight="flex"
        :filters="filters"
    >
        <template #header>
            <div class="flex flex-wrap gap-2 items-center justify-between">
                <h4 class="m-0">{{ props.title }}</h4>
                <Toolbar>
                    <template #start>
                        <Button label="Add" icon="pi pi-plus" severity="secondary" class="mr-2" @click="didClickAddRecord" />
                        <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedRecords || !selectedRecords.length" />
                    </template>
                    <template #end>
                        <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                    </template>
                </Toolbar>
                <IconField>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </IconField>
            </div>
        </template>

        <Column selectionMode="multiple" :exportable="false"></Column>
        <Column :exportable="false">
            <template #body="slotProps">
                <Button icon="pi pi-pencil" text rounded @click="didClickEditRecord(slotProps.data)" />
            </template>
        </Column> 
        <template v-for="(val, key, index) in tableSchema?.properties">
            <Column v-if="val.format=='date-time' || val.anyOf?.[0]?.format=='date-time'" :field="key" :header="key" sortable style="min-width: 16rem">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data[key]) }}
                </template>
            </Column>
            <Column v-else-if="key!='id'" :field="key" :header="key" sortable style="min-width: 16rem"></Column>
        </template>

    </DataTable>
</template>
