<script setup lang="ts">
import _ from 'lodash'
import { FilterMatchMode } from '@primevue/core/api'
import { RecordService } from '@/utils/service/RecordService'
import Papa from 'papaparse'
import { utils as XlsxUtils, writeFileXLSX } from 'xlsx'
import {v4 as uuidv4} from 'uuid'

const config = useRuntimeConfig()
const apiBaseUrl = computed(() => `${config.public.apiBase}/${props.tableName}`)
const schemasUrl = computed(() => `${config.public.apiBase}/schemas/${props.tableName}`)
const exportFilename = computed(() => `${props.tableName}_${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)}`)

const route = useRoute()
const localStorageKey = `settings::${route.path}`
const dtKey = ref(uuidv4())

const refreshFormattedValues = (ids?: string[]) => {
    const formattedColumnDefs = _.pickBy(props.columnDefs, (x) => _.isFunction(x.format))

    // set displayValue for columns with formatting functions
    for (const [k, v] of _.entries(formattedColumnDefs)) {
        const rows = ids ? _.filter(records.value, (x: any) => ids.includes(x.id)) : records.value
        for (const r of rows) {
            _.set(r, [k, 'displayValue'], v.format(r))
        }
    }
}

onMounted(async() => {
    tableSchema.value = props.schemaName ? await RecordService.getSchema(schemasUrl.value, props.schemaName) : null
    records.value = await RecordService.getRecords(apiBaseUrl.value, props.withClause, props.where)

    refreshFormattedValues()
    
    // calculate column definitions from JSON Schema properties and merge with columnDefs from props
    const tableColumnDefinitions =  _.mapValues(
        tableSchema.value?.properties, (v, k) => {
            // anyOf typically indicates a nullable field, but we're only concerned with the non-nullable one
            if (v.anyOf) { 
                v = _.find(v.anyOf, (x) => x.type != 'null')
            }
            return {
                header: formatFieldLabel(k),
                format: v.format || 'string',
                type: v.type,
            }
        }
    )
    // merge column definitions inferred from schema with those passed via props
    columnDefinitions.value = _.merge(tableColumnDefinitions, props.columnDefs)

    visibleColumnsOptions.value = _.compact(_.map(columnDefinitions.value, (v, k) => { if (k != 'id' && v.display !== false) return {name: k, code: k}}))
    
    const savedColumnVisibility = _.get(JSON.parse(localStorage.getItem(localStorageKey) || "{}"), 'columnVisibility')
    
    visibleColumns.value = savedColumnVisibility ?? visibleColumnsOptions.value
    loading.value = false
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
  rowsPerPageOptions: {type: Array as PropType<Array<number>> },
  selectionMode: {type: String, default: 'multiple'},
  rowActions: {type: Object},
  showColumnFilters: {type: Boolean, default: false},
})
const emit = defineEmits([
    'clicked-record-edit',
    'clicked-record-add',
    'clicked-multi-delete'
])

const sortedColumnDefs = computed(() => {
    const savedColumnOrder = _.get(JSON.parse(localStorage.getItem(localStorageKey) || "{}"), 'columnOrder')
    
    const columnDefsWithPaths = _.map(columnDefinitions.value, (v,k) => {
        const {path, ...rest} = v
        return {key: k, path: path ?? k, ...rest}}
    )
    return _.orderBy(
        columnDefsWithPaths,
        [
        i => _.has(i, 'index') || _.has(savedColumnOrder, i['path']),
        i => _.get(savedColumnOrder, i['path']) || i.index || ''
        ],
        ['desc', 'asc'])
    }
)

interface VisibleColumn {name: string, code: string}
const visibleColumnsOptions: Ref<VisibleColumn[]> = ref([])
const visibleColumns = ref()

interface ColumnDefinition {
    header?: string,
    index?: string,
    format?: string | ((data: any) => string),
    path?: string,
    type?: string,
    display?: boolean,
}
interface SortedColumnDefinition extends ColumnDefinition {
    key: string
}
export interface ColumnDefinitions {[key: string]: ColumnDefinition}
type GlobalFilterField = string | ((data: any) => string)

const paginator = computed(() => !_.isEmpty(props.rowsPerPageOptions))
const rowsPerPage: ComputedRef<number> = computed(() => _.get(props.rowsPerPageOptions, 0) as number)
const records: Ref<any[]> = ref([])
const selectedRecords: Ref<any[]> = ref([])
const tableSchema = ref()
const columnDefinitions: Ref<ColumnDefinitions> = ref({})
const dt = ref()
const displayDeleteConfirmation = ref(false)
const loading = ref(true)
const showSettings = ref(false)
const filteringInProgress = ref(false)
const globalFilterFields: Ref<GlobalFilterField[]> = ref([])
const globalSearchTerm = ref(null)
const selectionCount = computed(() => props.selectionMode == 'multiple' ? `${selectedRecords.value?.length || 0} of ${records.value?.length || 0} selected` : `${records.value?.length || 0} records`)

const filters = ref({global: { value: null, matchMode: FilterMatchMode.CONTAINS } })
// TODO: add support for posititing buttons in any column. For now, 0 or negative index action buttons will be combined into the first column, 
// any positive or non-indexed action buttons will be combined into the last column
const rowActionsStart = computed(() => props.rowActions ? _.pickBy(props.rowActions, (value, key) => _.isNumber(value.index) && value.index < 1) : {})
const rowActionsEnd = computed(() => props.rowActions ? _.pickBy(props.rowActions, (value, key) => !_.has(value, 'index') || value.index > 1) : {})

const displayColumnFilters = ref(false)
function toggleColumnFilters() {
    displayColumnFilters.value = !displayColumnFilters.value
}

watch(sortedColumnDefs, (newValue, oldValue) => {
  if (newValue != oldValue) {
    globalFilterFields.value = _.map(newValue, (x) => _.isFunction(x.format) ? x.format : (x.path ?? x.key))

    if (props.showColumnFilters) {
        const filtersEntries = newValue.reduce((acc, colDef) => {
            const key = colDef.path || colDef.key
            _.set(acc,[key],{ value: null, matchMode: FilterMatchMode.CONTAINS })
            return acc
        }, {})
        filters.value = _.merge({global: { value: null, matchMode: FilterMatchMode.CONTAINS } }, filtersEntries)
    }
  }
})

function formatDate(value: string) {
    const isoDate = value ? new Date(value) : null
    return isoDate?.toLocaleDateString('fr-CA') || ''
}

function didClickEditRecord(event: MouseEvent) {
    emit('clicked-record-edit', event)
}
function didClickDeleteSelectedRecords(event: MouseEvent) {
    RecordService.deleteRecords(apiBaseUrl.value, selectedRecords.value).then((result) => {
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Records deleted', life: 3000 })
        const deletedRecordIds = _.map(result, (x) => x.id)
        records.value = _.reject(records.value, (x) => deletedRecordIds.includes(x.id))
        selectedRecords.value = _.reject(selectedRecords.value, (x) => deletedRecordIds.includes(x.id))
    }).catch(error => {
        toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
    })
    displayDeleteConfirmation.value = false
}
function didClickAddRecord(event: MouseEvent) {
    emit('clicked-record-add', event)
}
function getExportRecords() {
    const recordsToExport = _.isEmpty(selectedRecords.value) ? records.value : selectedRecords.value
    const exportRecords = []
    for (const record of recordsToExport) {
        const exportRecord = {}
        for (const columnDef of sortedColumnDefs.value) {
            if (_.isFunction(columnDef.format)) {
                _.set(exportRecord, columnDef.key, columnDef.format(record))
            } else if (columnDef.format == 'date-time') {
                _.set(exportRecord, columnDef.key, formatDate(_.get(record, columnDef.path ?? columnDef.key)))
            } else if (columnDef.display !== false) {
                _.set(exportRecord, columnDef.key, _.get(record, columnDef.path ?? columnDef.key))
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
    
    const wb = XlsxUtils.book_new()
    const ws = XlsxUtils.aoa_to_sheet(rows)

    XlsxUtils.book_append_sheet(wb, ws, 'Sheet1')
    writeFileXLSX(wb, `${exportFilename.value}.xlsx`)
}

const addOrRefreshRecordId = async (recordId: string) => {
    const currentRecord = await RecordService.getRecord(apiBaseUrl.value, recordId, props.withClause)
    const existingRecordIndex = _.findIndex(records.value, {id: recordId})
    if (existingRecordIndex!=-1) {
        records.value[existingRecordIndex] = currentRecord
    } else {
        records.value = _.concat(records.value, currentRecord)
    }
    refreshFormattedValues([recordId])
}

const removeRecordId = (recordId: string) => {
    records.value = _.reject(records.value, {id: recordId})
}

function confirmDeleteSelected() {
    displayDeleteConfirmation.value = true
}

function columnHeader(sortedColumnDef: SortedColumnDefinition) {
    return sortedColumnDef.header || _.startCase(sortedColumnDef.key)
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

function setGlobalSearchTerm() {
    _.set(filters.value, ['global', 'value'], globalSearchTerm.value)
}

function debounceSearch(f: Function) {
    filteringInProgress.value = true
    return _.debounce(() => {
        f()
}, 1000)}

function clearSettings() {
    // set column visibility to defaults
    visibleColumns.value = visibleColumnsOptions.value

    // clear saved values
    localStorage.removeItem(localStorageKey)

    // force datatable to refresh
    dtKey.value = uuidv4()
}

function saveSettings() {
    const newColumnOrder = _.mapValues(_.keyBy(_.map(dt.value.columns, (v, i) => {return {index: i, value: v.props.field || v.props.columnKey}}), 'value'), 'index')
    localStorage.setItem(localStorageKey, JSON.stringify({
        columnOrder: newColumnOrder,
        columnVisibility: visibleColumns.value,
    }))
    showSettings.value = false
}

function filterByColumnVisibility(columns: SortedColumnDefinition[]): SortedColumnDefinition[] {
    const visibleColumnKeys = _.map(visibleColumns.value, (x) => x.code)
    return _.filter(columns, (x) => x.key == 'id' || _.includes(visibleColumnKeys, x.key))
}
</script>

<template>
    <DataTable
        ref="dt"
        :key="dtKey" 
        v-model:selection="selectedRecords"
        :value="records"
        dataKey="id"
        :nullSortOrder="-1"
        scrollable 
        scrollHeight="flex"
        v-model:filters="filters"
        :paginator="paginator"
        :reorderableColumns="true"
        :rows="rowsPerPage"
        :rowsPerPageOptions="props.rowsPerPageOptions"
        :loading="loading"
        table-class="border-collapse"
        filterHeaderClass="border-collapse"
        :filter-display="displayColumnFilters ? 'row' : undefined"
        :globalFilterFields="globalFilterFields"
        @update:filters="filteringInProgress = true"
        @filter="filteringInProgress = false"
    >
        <template #header>
            <div class="flex flex-wrap gap-2 items-center justify-between">
                <h4 class="m-0">{{ props.title }}</h4>
                <Toolbar class="border-0">
                    <template #start>
                        <span class="mr-5">{{ selectionCount }}</span>
                        <Button v-if="props.canAdd" label="Add" icon="pi pi-plus" severity="secondary" class="mr-2" @click="didClickAddRecord" />
                        <Button v-if="props.canDelete" label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedRecords || !selectedRecords.length" />
                    </template>
                    <template #end>
                        <SplitButton label="Export" class="mr-2" :model="exportOptions" severity="secondary" @click="exportXLSX"></SplitButton>
                        <Button icon="pi pi-cog" :disabled="showSettings" class="mr-2" severity="secondary" @click="showSettings=!showSettings"/>
                        <IftaLabel :class="`mr-2 ${showSettings ? 'visible' : 'invisible'}`">
                            <MultiSelect inputId="visibileColumnsInput" v-model="visibleColumns" :options="visibleColumnsOptions" optionLabel="name" :maxSelectedLabels="0" placeholder="select" />
                            <label for="visibileColumnsInput" v-if="showSettings">Columns</label>
                        </IftaLabel>
                        <Button icon="pi pi-sync" :class="`mr-2 ${showSettings ? 'visible' : 'invisible'}`" severity="secondary" v-tooltip="{value: 'Clear settings', showDelay: 1000}" @click="clearSettings"/>
                        <Button icon="pi pi-check" :class="`mr-2 ${showSettings ? 'visible' : 'invisible'}`" style="color: green" severity="secondary" v-tooltip="{value: 'Save settings', showDelay: 1000}" @click="saveSettings" />
                        
                        <ProgressSpinner :class="`size-8 ${filteringInProgress ? 'visible' : 'invisible'}`" />
                    </template>
                </Toolbar>
                <IconField>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="globalSearchTerm" placeholder="Search..." @input="debounceSearch(setGlobalSearchTerm)()"/>
                </IconField>
            </div>
        </template>
        <template #empty> No data </template>
        <template #loading> Loading </template>

        <Column columnKey="selectBox" :reorderableColumn="false" class="w-0 !pl-6" v-if="selectionMode=='multiple'" :selectionMode="selectionMode" :exportable="false"></Column>
        <Column columnKey="crudButtons" :reorderableColumn="false" :class="`whitespace-nowrap !pr-0 w-0 ${selectionMode=='multiple' ? '!pl-0' : ''}`" v-if="props.canEdit || displayColumnFilters" :exportable="false" :showFilterMenu="false">
            <template v-if="showColumnFilters" #header>
                <Button :icon="displayColumnFilters ? 'pi pi-search-minus' : 'pi pi-search-plus'" text rounded severity="info" @click="toggleColumnFilters"/> 
            </template>
            <template #body="slotProps">
                <div class="group">
                    <Button v-if="props.canEdit" icon="pi pi-pencil" text rounded @click="didClickEditRecord(slotProps.data)" />
                    <Button :class="v.class" :key="`${slotProps.data.id}-${k}`" :icon="v.icon" text rounded v-for="(v, k) in rowActionsStart" :severity="v.severity || 'info'" @click="v.action(slotProps.data)" />
                </div>
            </template>
        </Column>
        <template v-for="columnDef of filterByColumnVisibility(sortedColumnDefs)">
            <template v-if="columnDef.display!==false">
                <Column v-if="columnDef.format=='date-time'" :field="columnDef.path" :header="columnHeader(columnDef)" :reorderableColumn="showSettings" style="width: max-content !important; min-width: max-content !important; max-width: max-content !important;" :showFilterMenu="false" :showClearButton="false" sortable>
                    <template v-if="_.has(filters, columnDef.path)" #filter="{ filterModel, filterCallback }">
                        <InputText class="w-full m-0 p-1" v-model="filterModel.value" type="text" @input="debounceSearch(filterCallback)()" />
                    </template>
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data[columnDef.key]) }}
                    </template>
                </Column>
                <Column v-else-if="columnDef.type=='boolean' || _.includes(columnDef.type, 'boolean')" :field="columnDef.path" :header="columnHeader(columnDef)" :reorderableColumn="showSettings" style="width: max-content !important; min-width: max-content !important; max-width: max-content !important;" :showFilterMenu="false" :showClearButton="false" sortable>
                    <template v-if="_.has(filters, columnDef.path)" #filter="{ filterModel, filterCallback }">
                        <InputText class="w-full m-0 p-1" v-model="filterModel.value" type="text" @input="debounceSearch(filterCallback)()" />
                    </template>
                    <template #body="slotProps">
                        {{ slotProps.data[columnDef.key] ? '✓' : '' }}
                    </template>
                </Column>
                <Column v-else-if="columnDef.key!='id'" :field="columnDef.path" :header="columnHeader(columnDef)" :reorderableColumn="showSettings" style="width: max-content !important; min-width: max-content !important; max-width: max-content !important;" :showFilterMenu="false" :showClearButton="false" sortable>
                    <template v-if="_.has(filters, columnDef.path)" #filter="{ filterModel, filterCallback }">
                        <InputText class="w-full m-0 p-1" v-model="filterModel.value" type="text" @input="debounceSearch(filterCallback)()" />
                    </template>
                    <template #body="slotProps">
                        {{ columnDef.type == 'array' ? _.join(_.get(slotProps.data, columnDef.path), ', ') : _.get(slotProps.data, columnDef.path) }}
                    </template>
                </Column>
            </template>
        </template>
        <Column class="whitespace-nowrap" v-if="rowActionsEnd" columnKey="rowActions" :reorderableColumn="false" >
            <template #body="{ data }">
                <div class="flex items-start">
                    <template v-for="(v, k) in rowActionsEnd">
                        <Button v-tooltip.top="v.tooltip" v-if="!v.iconComponent" class="mr-1 mb-1" :icon="v.icon" :iconPos="v.iconPos" :severity="v.severity || 'info'" :label="v.label ? v.label(data) : _.startCase(k)" @click="v.action(data)" />
                        <Button v-tooltip.top="v.tooltip" v-if="v.iconComponent" class="mr-1 mb-1" :severity="v.severity || 'info'" :label="v.label ? v.label(data) : _.startCase(k)" @click="v.action(data)">
                            <template #icon>
                                <span :class="`pi pi-fw p-button-icon ${v.iconPos=='right' ? 'p-button-icon-right' : ''} inline-block`">
                                    <component :is="v.iconComponent" />
                                </span>
                            </template>
                        </Button>
                    </template>
                </div>
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

<style>
.p-datatable-header-cell {
    border-bottom-width: 0px;
}
.p-datatable-thead > tr:last-child {
    border-bottom-width: 1px;
}
</style>
