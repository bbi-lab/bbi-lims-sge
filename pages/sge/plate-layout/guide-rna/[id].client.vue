<script setup lang="ts">
import _ from 'lodash'
import { getWellTextColor, wellCoordinateToChar } from '~/lib/plate-diagram'
import { read as readXlsx, utils as XlsxUtils } from 'xlsx'

const { breakpoints } = useLayout()
const route = useRoute()
const plateLayout = usePlateLayout()
const config = useRuntimeConfig()
const { showLoginModal } = useLayout()
const toast = useToast()

const smallerThanLg = breakpoints.smaller('lg')
const plateWithWellSpecs = ref()
const plateDiagramKey = ref(0)

onMounted(async() => {
    plateLayout.setPlateId(route.params.id as string)
    plateLayout.wellContentsDisplayConfig.value = {
        colorBy: ['oligo.targetId'],
        selectionTableRecordIdPaths: ['oligoId'],
        tooltip: (well: any) => {
            const wellCoordinate = `${wellCoordinateToChar(well.y)}${well.x}`
            const oligos = _.map(well.wellContents, 'oligo')
            return oligos ? `${wellCoordinate}:<br>` + _.map(oligos, 'name').join('<br>') : wellCoordinate
        },
        symbol: (well: any) => {
            const oligos = _.compact(_.map(well.wellContents, 'oligo'))
            return oligos ? _.size(oligos) : ''
        },
    }
    loadPlate()
})

const loadPlate = async () => {
    await plateLayout.loadPlate(
        {
            oligo: true,
        },
    )

    plateWithWellSpecs.value = {
        ...plateLayout.plateWithWellContents.value,
        wells: _.values(plateLayout.wellSpecs.value),
    }
}
const fileToSheet = (file: any, callback: any) => {
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = readXlsx(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        const jsonData = XlsxUtils.sheet_to_json(worksheet)
        callback(_.map(jsonData, (data: JSON) => _.mapKeys(data, (value, key) => _.camelCase(key))))
    }
    reader.readAsArrayBuffer(file)
}

const importSgRnaOligos = (e: any) => {
    try {
        const files = e.files
        const f = files[0]

        fileToSheet(f, submitSgRnaOligos)
    } catch (error) {
        console.error('Error importing sgRNA oligos:', error)
    }
}

const submitSgRnaOligos = async (data: any[]) => {
    try {
        const result = await $fetch(`${config.public.apiBase}/custom/plates/${route.params.id}/import-sg-rna-oligos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data,
        })
        if (!_.isEmpty(result)) {
            toast.add({
                severity: 'success',
                summary: 'sgRNA oligos imported',
                life: 3000,
            })
            _.forEach(result as any[], (x) => {
                plateLayout.selectionTableRef.value.addOrRefreshRecordId(x.id)
            })
            await loadPlate()
            // force a re-render of the plate diagram
            plateDiagramKey.value += 1
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error importing sgRNA oligos',
                life: 3000,
            })
        }
    } catch (error: any) {
        if (error.statusCode == 401 && error.statusMessage == 'TOKEN EXPIRED') {
            showLoginModal()
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 5000 })
        }
    }
}
const displayWithClause = {
    wellContents: {
        with: {
            well: {
                columns: {
                    id: true,
                    x: true,
                    y: true,
                },
                with: {
                    plate: {
                        columns: {
                            id: true,
                            name: true,
                            plateType: true,
                        }
                    }
                }
            },
        },
    },
    target: {
        columns: {
            name: true,
        },
    },
}
const columnDefs = {
    colorTile:{
        index: 0,
        header: '',
        sortable: false,
        type: 'element',
        element: (x: any) => {
            const wellSpec = plateLayout.getWellSpecBySelectionTableRecordId(x.id)
            return wellSpec ? `<span
                class="inline-block w-6 h-6 rounded-sm text-center"
                style="color: ${getWellTextColor(wellSpec.color)}; background-color:${wellSpec.color}">
                ${wellSpec.symbol}
            </span>` : ''
        },
        searchable: false,
        exportable: false,
    },
    sequence: { display: false },
    kit: {display: false},
    name: {
        index: 1,
    },
    target: {
        header: 'Target',
        format: (x: any) => {
            return x.target ? x.target.name : ''
        },
        path: 'target.displayValue',
        index: 2,
    },
    targetId: { display: false },
    wellContents: {
        header: 'Location',
        format: (x: any) => {
            const wellContents = _.find(x.wellContents, (x) => x.well.plate.id == route.params.id)
            return wellContents ? ` ${_.get(wellContents, 'well.plate.name')}: ${wellCoordinateToChar(wellContents.well?.y)}${wellContents.well?.x}` : ''
        },
        path: 'wellContents.displayValue',
        type: 'string',
        index: 3,
    },
}
const frozenRecordIds = computed(() => {
    return _.compact(_.flatten(_.map(plateLayout.selectedWells.value, 'selectionTableRecordIds')))
})
</script>
<template>
    <Splitter class="h-full mb-8" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
        <SplitterPanel class="overflow-scroll" :size="60">
            <QuickTable
                :ref="plateLayout.setSelectionTableRef"
                tableName="oligos"
                schemaName="select"
                :canAdd="false"
                :canEdit="false"
                :canExport="true"
                :withClause="displayWithClause"
                :columnDefs="columnDefs"
                :showColumnFilters="true"
                emptyMessage=""
                v-model:frozenRecordIds="frozenRecordIds"
            />
        </SplitterPanel>
        <SplitterPanel class="flex justify-center overflow-scroll mt-10" :size="40" :minSize="25">
            <PlateDiagram
                :key="plateDiagramKey"
                :ref="plateLayout.setPlateDiagramRef"
                v-if="plateWithWellSpecs"
                v-model="plateWithWellSpecs"
                :plateType="plateWithWellSpecs.plateType"
                :sizeX="plateWithWellSpecs.sizeX"
                :sizeY="plateWithWellSpecs.sizeY"
                @well-range-selected="plateLayout.wellRangeSelected"
                @well-selection-cleared="plateLayout.wellSelectionCleared"
                @all-wells-selected="plateLayout.selectedAllWells"
                @well-contents-updated="plateLayout.updatedWellContents" >
                <template #header>
                    {{ plateWithWellSpecs.name }}
                </template>
                <template #button1>
                    <FileUpload
                        mode="basic"
                        accept="application/msexcel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                        class="p-button-icon-only p-button-info"
                        :maxFileSize="1000000"
                        :customUpload="true"
                        :auto="true"
                        @uploader="importSgRnaOligos"
                        chooseLabel=""
                        v-tooltip="{value: 'Upload sgRNA oligos', showDelay: 500}"
                    >
                        <template #chooseicon>
                            <i class="pi pi-upload"></i>
                        </template>
                        <template #uploadicon>
                            <i class="pi pi-upload"></i>
                        </template>
                    </FileUpload>
                </template>
                <template #button2>
                    <Button
                        class="p-button-secondary"
                        icon="pi pi-trash"
                        v-tooltip="{value: 'Empty selected wells', showDelay: 500}"
                        :disabled="_.isEmpty(plateLayout.selectedWells.value)"
                        @click="plateLayout.emptySelectedWells" />
                </template>
            </PlateDiagram>
        </SplitterPanel>
    </Splitter>
</template>
