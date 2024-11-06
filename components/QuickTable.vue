<script setup>
import _ from 'lodash'
import { FilterMatchMode } from '@primevue/core/api'
import { RecordService } from '@/utils/service/RecordService'

const config = useRuntimeConfig()
const apiBaseUrl = computed(() => `${config.public.apiBase}/${props.tableName}`)
const schemasUrl = computed(() => `${config.public.apiBase}/schemas/${props.tableName}`)

onMounted(async() => {
    tableSchema.value = await RecordService.getSchema(schemasUrl.value, props.schemaName)
    records.value = await RecordService.getRecords(apiBaseUrl.value, props.withClause, props.where)

    // if columnDefs prop is not set, calculate from JSON Schema properties
    columnDefinitions.value = props.columnDefs || _.mapValues(
        tableSchema.value?.properties, (k,v) => {
            return {
                header: _.startCase(v),
                format: k.format || 'string'
            }
        }
    )
})

const toast = useToast()
const props = defineProps({
  tableName: String,
  schemaName: String,
  title: String,
  columnDefs: {type: Object}, // if set, only included columns will be shown
  withClause: {type: Object},
  where: {type: Object},
  canAdd: {type: Boolean, default: true},
  canEdit: {type: Boolean, default: true},
  canDelete: {type: Boolean, default: true},
  rowsPerPageOptions: {type: Array},
  rowActions: {type: Object},
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
const columnDefinitions = ref({})
const dt = ref()
const displayDeleteConfirmation = ref(false)

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
function didClickDeleteSelectedRecords(event) {
    RecordService.deleteRecords(apiBaseUrl.value, selectedRecords.value).then((result) => {
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Records deleted', life: 3000 })
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
    const currentRecord = await RecordService.getRecord(apiBaseUrl.value, recordId, props.withClause)
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
        <template #empty> No data </template>
        <template #loading> Loading </template>

        <Column class="w-0.5" selectionMode="multiple" :exportable="false"></Column>
        <Column class="w-0.5" v-if="props.canEdit" :exportable="false">
            <template #body="slotProps">
                <Button icon="pi pi-pencil" text rounded @click="didClickEditRecord(slotProps.data)" />
            </template>
        </Column> 
        <template v-for="(v,k) in columnDefinitions">
            <Column v-if="v.format=='date-time'" :field="k" :header="v.header" sortable style="min-width: 16rem">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data[k]) }}
                </template>
            </Column>
            <Column v-else-if="_.isFunction(v.format)" :field="k" :header="v.header" sortable style="min-width: 16rem">
                <template #body="slotProps">
                    {{ v.format(slotProps.data[k]) }}
                </template>
            </Column>
            <Column v-else-if="k!='id'" :field="k" :header="v.header" sortable style="min-width: 16rem">
                <template #body="slotProps">
                    {{ slotProps.data[k] }}
                </template>
            </Column>
        </template>
        <Column v-if="rowActions">
            <template #body="{ data }">
                <Button v-for="(v, k) in rowActions" severity="info" :label="v.label ? v.label(data) : _.startCase(k)" @click="v.action(data)" />
            </template>
        </Column>
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
