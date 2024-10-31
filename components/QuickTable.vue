<script setup>
import _ from 'lodash'
import { FilterMatchMode } from '@primevue/core/api'
import { RecordService } from '@/utils/service/RecordService'

onMounted(async() => {
    tableSchema.value = await RecordService.getSchema(props.apiBaseUrl, props.schemaName)
    records.value = await RecordService.getRecords(props.apiBaseUrl, props.withClause)
})

const toast = useToast()
const props = defineProps({
  apiBaseUrl: String,
  schemaName: String,
  title: String,
  withClause: {type: Object},
  canAdd: {type: Boolean, default: true},
  canEdit: {type: Boolean, default: true},
  canDelete: {type: Boolean, default: true},
  rowsPerPageOptions: {type: Array}
})
const emit = defineEmits([
    'clicked-record-edit',
    'clicked-record-add',
    'clicked-record-delete',
    'clicked-multi-delete'
])

const paginator = computed(() => !_.isEmpty(props.rowsPerPageOptions))
const rowsPerPage = computed(() => props.rowsPerPageOptions?.[0] || null)
const records = ref([])
const selectedRecords = ref([])
const tableSchema = ref()
const dt = ref()
const displayDeleteConfirmation = ref(false)

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

function formatDate(value) {
    const date = value ? new Date(value) : null
    return date ? date.toISOString().split('T')[0] : ''
}
function getDisplayValue(val, oneOf) {
    if (!val) return ''
    const displayValue = _.find(oneOf, {const: val})
    return displayValue.title
}
function didClickEditRecord(event) {
    emit('clicked-record-edit', event)
}
function didClickDeleteSelectedRecords(event) {
    RecordService.deleteRecords(props.apiBaseUrl, selectedRecords.value).then((result) => {
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Specimens deleted', life: 3000 })
        const deletedRecordIds = _.map(result, (x) => x.id)
        records.value = _.reject(records.value, (x) => deletedRecordIds.includes(x.id))
        selectedRecords.value = _.reject(selectedRecords.value, (x) => deletedRecordIds.includes(x.id))
    })
    displayDeleteConfirmation.value = false
}
function didClickAddRecord(event) {
    emit('clicked-record-add', event)
}
function exportCSV() {
    dt.value.exportCSV()
}

const addOrRefreshRecordId = async (recordId) => {
    console.log("REFRESHING")
    const currentRecord = await RecordService.getRecord(props.apiBaseUrl, recordId, 'table')
    const existingRecordIndex = _.findIndex(records.value, {id: recordId})
    if (existingRecordIndex!=-1) {
        records.value[existingRecordIndex] = currentRecord
    } else {
        records.value = _.concat(records.value, currentRecord)
    }
}

const removeRecordId = (recordId) => {
    records.value = _.reject(records.value, {id: recordId})
}

function confirmDeleteSelected() {
    displayDeleteConfirmation.value = true
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
        :paginator="paginator"
        :rows="rowsPerPage" 
        :rowsPerPageOptions="props.rowsPerPageOptions"
    >
        <template #header>
            <div class="flex flex-wrap gap-2 items-center justify-between">
                <h4 class="m-0">{{ props.title }}</h4>
                <Toolbar>
                    <template #start>
                        <Button v-if="props.canAdd" label="Add" icon="pi pi-plus" severity="secondary" class="mr-2" @click="didClickAddRecord" />
                        <Button v-if="props.canDelete" label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedRecords || !selectedRecords.length" />
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
        <Column v-if="props.canEdit" :exportable="false">
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
            <Column v-else-if="val.oneOf" :field="key" :header="key" sortable style="min-width: 16rem">
                <template #body="slotProps">
                    {{ getDisplayValue(slotProps.data[key], val.oneOf) }}
                </template>
            </Column>
            <Column v-else-if="key!='id'" :field="key" :header="key" sortable style="min-width: 16rem"></Column>
        </template>

    </DataTable>
    <Dialog header="Confirmation" v-model:visible="displayDeleteConfirmation" :style="{ width: '350px' }" :modal="true">
        <div class="flex items-center justify-center">
            <i class="pi pi-exclamation-triangle mr-4" style="font-size: 2rem" />
            <span>Are you sure you want to proceed?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" @click="displayDeleteConfirmation=!displayDeleteConfirmation" text severity="secondary" />
            <Button label="Yes" icon="pi pi-check" @click="didClickDeleteSelectedRecords" severity="danger" outlined autofocus />
        </template>
    </Dialog>
</template>
