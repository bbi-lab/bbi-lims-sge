<script setup>
import _ from 'lodash'
import { FilterMatchMode } from '@primevue/core/api'
import { RecordService } from '@/utils/service/RecordService'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const config = useRuntimeConfig()
const apiBaseUrl = computed(() => `${config.public.apiBase}/${props.tableName}`)
const schemasUrl = computed(() => `${config.public.apiBase}/schemas/${props.tableName}`)
const exportFilename = computed(() => `${props.tableName}_${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)}`)

onMounted(async() => {
    tableSchema.value = await RecordService.getSchema(schemasUrl.value, props.schemaName)
    records.value = await RecordService.getRecords(apiBaseUrl.value, props.withClause, props.where)
    loading.value = false

    // calculate column definitions from JSON Schema properties and merge with columnDefs from props
    columnDefinitions.value =  _.mapValues(
        tableSchema.value?.properties, (k,v) => {
            return {
                header: _.startCase(v),
                format: k.format || 'string'
            }
        }
    )
    if (props.columnDefs) columnDefinitions.value = {...columnDefinitions.value, ...props.columnDefs}

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
  selectionMode: {type: String, default: 'multiple'},
  rowActions: {type: Object},
})
const emit = defineEmits([
    'clicked-record-edit',
    'clicked-record-add',
    'clicked-record-delete',
    'clicked-multi-delete'
])

const sortedColumnDefs = computed(() => _.orderBy(
    _.map(columnDefinitions.value, (v,k) => {return {key: k, ...v}}),
    [
      i => _.has(i, 'index'),
      i => i.index || ''
    ],
    ['desc', 'asc'])
)

const paginator = computed(() => !_.isEmpty(props.rowsPerPageOptions))
const rowsPerPage = computed(() => props.rowsPerPageOptions?.[0] || null)
const records = ref([])
const selectedRecords = ref([])
const tableSchema = ref()
const columnDefinitions = ref({})
const dt = ref()
const displayDeleteConfirmation = ref(false)
const loading = ref(true)

const globalFilterFields = ref([])
const selectionCount = computed(() => props.selectionMode == 'multiple' ? `${selectedRecords.value?.length || 0} of ${records.value?.length || 0} selected` : `${records.value?.length || 0} records`)

watch(sortedColumnDefs, (newValue, oldValue) => {
  if (newValue != oldValue) {
    globalFilterFields.value = _.map(newValue, (x) => _.isFunction(x.format) ? x.format : x.key)
  }
})

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
function getExportRecords() {
    const recordsToExport = _.isEmpty(selectedRecords.value) ? records.value : selectedRecords.value
    const exportRecords = []
    for (const record of recordsToExport) {
        const exportRecord = {}
        for (const columnDef of sortedColumnDefs.value) {
            if (_.isFunction(columnDef.format)) {
                exportRecord[columnDef.key] = columnDef.format(record)
            } else if (columnDef.format == 'date-time') {
                exportRecord[columnDef.key] = formatDate(record[columnDef.key])
            } else if (columnDef.display !== false) {
                exportRecord[columnDef.key] = record[columnDef.key]
            }
        }
        exportRecords.push(exportRecord)
    }
    return exportRecords
}
function exportCSV() {
    // dt.value.exportCSV()  // default export for PrimeVue DataTable

    const csv = Papa.unparse(getExportRecords())
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${exportFilename.value}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

const exportXLSX = function() {
    const exportRecords = getExportRecords()
    const rows = []
    
    // column headers row
    if (!_.isEmpty(exportRecords)) {
        rows.push(_.keys(exportRecords[0]))
    } else {
        rows.push(_.map(sortedColumnDefs.value, (x) => x.key))
    }

    // data rows
    for (const record of exportRecords) {
        rows.push(_.values(record))
    }
    
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(rows)

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, `${exportFilename.value}.xlsx`)
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

function columnHeader(columnDef) {
    return columnDef.header || _.startCase(columnDef.key)
}
const exportOptions = ref([
    {
        label: 'XLSX',
        icon: 'pi pi-file-excel',
        command: () => exportXLSX()
    },
    {
        label: 'CSV',
        icon: 'pi pi-file',
        command: () => exportCSV()
    }
])
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
        :selectionMode="selectionMode"
        :filters="filters"
        :paginator="paginator"
        :rows="rowsPerPage" 
        :rowsPerPageOptions="props.rowsPerPageOptions"
        :loading="loading"
        :globalFilterFields="globalFilterFields"
    >
        <template #header>
            <div class="flex flex-wrap gap-2 items-center justify-between">
                <h4 class="m-0">{{ props.title }}</h4>
                <Toolbar>
                    <template #start>
                        <span class="mr-5">{{ selectionCount }}</span>
                        <Button v-if="props.canAdd" label="Add" icon="pi pi-plus" severity="secondary" class="mr-2" @click="didClickAddRecord" />
                        <Button v-if="props.canDelete" label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedRecords || !selectedRecords.length" />
                    </template>
                    <template #end>
                        <SplitButton label="Export" :model="exportOptions" severity="secondary" @click="exportXLSX"></SplitButton>
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

        <Column class="w-0.5" v-if="selectionMode=='multiple'" :selectionMode="selectionMode" :exportable="false"></Column>
        <Column class="w-0.5" v-if="props.canEdit" :exportable="false">
            <template #body="slotProps">
                <Button icon="pi pi-pencil" text rounded @click="didClickEditRecord(slotProps.data)" />
            </template>
        </Column>
        <template v-for="columnDef of sortedColumnDefs">
            <template v-if="columnDef.display!==false">
                <Column v-if="columnDef.format=='date-time'" :field="columnDef.key" :header="columnHeader(columnDef)" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data[columnDef.key]) }}
                    </template>
                </Column>
                <Column v-else-if="_.isFunction(columnDef.format)" :field="columnDef.key" :header="columnHeader(columnDef)" :sort-field="columnDef.format" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ columnDef.format(slotProps.data) }}
                    </template>
                </Column>
                <Column v-else-if="columnDef.key!='id'" :field="columnDef.key" :header="columnHeader(columnDef)" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ slotProps.data[columnDef.key] }}
                    </template>
                </Column>
            </template>
        </template>
        <Column v-if="rowActions">
            <template #body="{ data }">
                <Button class="mr-1" v-for="(v, k) in rowActions" severity="info" :label="v.label ? v.label(data) : _.startCase(k)" @click="v.action(data)" />
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
