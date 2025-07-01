<script setup lang="ts">
import _ from 'lodash'
import { RecordService } from '~/utils/service/RecordService'

const { breakpoints } = useLayout()
const route = useRoute()
const router = useRouter()
const plateLayout = usePlateLayout()
const toast = useToast()

const smallerThanLg = breakpoints.smaller('lg')
const plasmidExperiment = ref()
const config = useRuntimeConfig()
const selectionTableName = ref<string>('view-plates-with-well-counts')
const selectionTableKey = ref(0)

onMounted(async() => {
    nextTick(() => refreshExperiment())
})

const refreshExperiment = async () => {
    plasmidExperiment.value = await RecordService.getRecord(`${config.public.apiBase}/plasmid-experiments`, route.params.id as string,
    {
        plates: true,
        snvLibs: true,
    })
}
const selectionTableOptions = [
    { label: 'Guide RNA plates', value: 'view-plates-with-well-counts' },
    { label: 'SNV library', value: 'plasmids' },
]

watch(selectionTableName, async (newValue) => {
    selectionTableKey.value += 1
})

const whereClause = computed(() => {
    if (selectionTableName.value === 'plasmids') {
        return {
            and: [
                {"==": [{"var": "plasmidType"}, "library"]},
                {"!=": [{"var": "plasmidExperimentId"}, route.params.id as string]},
            ]
        }
    } else if (selectionTableName.value === 'view-plates-with-well-counts') {
        return {
            and: [
                {"==": [{"var": "plateType"}, "guide-rna"]},
                {"!=": [{"var": "plasmidExperimentId"}, route.params.id as string]},
            ]
        }
    } else {
        return {}
    }
})

const frozenRecordIds = computed(() => {
    return _.compact(_.flatten(_.map(plateLayout.selectedWells.value, 'selectionTableRecordIds')))
})
const columnDefs = computed(() => {
    if (selectionTableName.value === 'view-plates-with-well-counts') {
        return {
            plateType: { display: false },
            plateTypeLabel: { header: 'Type' },
            cycleName: { display: false },
            cycleId: { display: false },
            targets: { display: false },
            pcrExperimentId: { display: false},
            plasmidExperimentId: { display: false},
            discarded: { display: false},
            processed: { display: false},
            sizeX: { display: false },
            sizeY: { display: false },
            wellsCount: { display: false },
            wellsWithContentCount: { display: false },
            wellsProcessedCount: { display: false },
            filled: {
                format: (data: any) => {
                    if (data.wellsCount - data.wellsWithContentCount) {
                        return `${data.wellsWithContentCount} / ${data.wellsCount}`
                    } else {
                        return '-'
                    }
                },
                path: 'filled.displayValue',
            },
        }
    } else if (selectionTableName.value === 'plasmids') {
        return {
            targetId: { display: false },
            plasmidExperimentId: { display: false },
            wellContents: {display: false}
        }
    }
    return {}
})
const removePlasmidFromExperiment = async (id: string) => {
    await RecordService.updateRecord(`${config.public.apiBase}/plasmids`, {
            id,
            plasmidExperimentId: null
    })
    refreshExperiment()
    selectionTableKey.value += 1
    toast.add({severity: 'success', summary: 'Success', detail: 'Removed from experiment', life: 3000})
}
const removePlateFromExperiment = async (id: string) => {
    await RecordService.updateRecord(`${config.public.apiBase}/plates`, {
            id,
            plasmidExperimentId: null
    })
    refreshExperiment()
    selectionTableKey.value += 1
    toast.add({severity: 'success', summary: 'Success', detail: 'Removed from experiment', life: 3000})
}
const rowActions = {
    assign: {
        label: '',
        action: async (data: any) => {
            if (selectionTableName.value === 'view-plates-with-well-counts') {
                await RecordService.updateRecord(`${config.public.apiBase}/plates`, {
                    id: data.id,
                    plasmidExperimentId: route.params.id as string
                })
                refreshExperiment()
                selectionTableKey.value += 1
            } else if (selectionTableName.value === 'plasmids') {
                await RecordService.updateRecord(`${config.public.apiBase}/plasmids`, {
                    id: data.id,
                    plasmidExperimentId: route.params.id as string
                })
                refreshExperiment()
                selectionTableKey.value += 1
            }
        },
        icon: 'pi pi-fw pi-arrow-right',
        iconPos: 'right',
        tooltip: 'Add to experiment',
    },
}
</script>
<template>
    <Splitter class="h-full mb-8" :layout="smallerThanLg ? 'vertical' : 'horizontal'">
        <SplitterPanel class="overflow-scroll" :size="60">
            <QuickTable
                :key="selectionTableKey"
                :ref="plateLayout.setSelectionTableRef"
                :tableName="selectionTableName"
                schemaName="select"
                :canAdd="false"
                :canDelete="false"
                :canEdit="false"
                :canExport="false"
                :where="whereClause"
                :columnDefs="columnDefs"
                :rowActions="rowActions"
                :showColumnFilters="true"
                selectionMode="single"
                emptyMessage="">
                <template #header-buttons>
                    <SelectButton v-model="selectionTableName" :options="selectionTableOptions" optionLabel="label" optionValue="value" dataKey="label" />
                </template>
            </QuickTable>
        </SplitterPanel>
        <SplitterPanel class="overflow-scroll mt-10 ml-5" :size="40" :minSize="25">
            <template v-if="plasmidExperiment">
                <div class="text-lg font-bold mb-2">
                    sg-RNA cloning: {{ plasmidExperiment.name }}
                </div>
                <hr/>
                <div class="font-bold mb-2">
                    Plates:
                </div>
                <div v-for="plate of plasmidExperiment.plates" class="mb-2">
                    {{ plate.name }}
                    <Button
                        class="ml-2"
                        severity="info"
                        v-tooltip="{ value: 'Plate layout', showDelay: 300 }"
                        @click="router.push({path:`/sge/plate-layout/guide-rna/${plate.id}`})"
                    >
                        <template #icon>
                            <span class="p-button-icon-right inline-block">
                               <PhGridNineFill />
                            </span>
                        </template>
                    </Button>
                    <Button
                        class="ml-2"
                        icon="pi pi-times"
                        severity="danger"
                        outlined
                        v-tooltip="{ value: 'Remove from experiment', showDelay: 300 }"
                        @click="removePlateFromExperiment(plate.id)" />
                </div>
                <hr/>
                <div class="font-bold mb-2">
                    SNV-lib:
                </div>
                <div v-for="snvLib of plasmidExperiment.snvLibs" class="mb-2">
                    {{ snvLib.name }}
                    <Button
                        as="a"
                        class="ml-2"
                        severity="info"
                        icon="pi pi-spinner"
                        v-tooltip="{ value: 'Plasmid', showDelay: 300 }"
                        :href="`/sge/plasmids?id=${snvLib.id}`"
                    >
                    </Button>
                    <Button
                        class="ml-2"
                        icon="pi pi-times"
                        severity="danger"
                        outlined
                        v-tooltip="{ value: 'Remove from experiment', showDelay: 300 }"
                        @click="removePlasmidFromExperiment(snvLib.id)" />
                </div>
            </template>
        </SplitterPanel>
    </Splitter>
</template>
