<script setup lang="ts">
import _ from 'lodash'
import type { PlateWithPlateDiagramWells } from '~/components/PlateDiagram.vue'
import { type PlateDiagramWell } from '~/composables/lib/plate-diagram'
import { RecordService } from '~/utils/service/RecordService'
import { updateWellSpecs, type PlateWithWellContents, type WellSpecs } from '~/utils/sge/plateUtils'

const unpooledPlateWithWellContents = ref<PlateWithWellContents>()
const pooledPlateWithWellContents = ref<PlateWithWellContents>()
const unpooledPlateDiagram = ref()
const pooledPlateDiagram = ref()
const unpooledPlateWithPlateDiagramWells = ref<PlateWithPlateDiagramWells>()
const pooledPlateWithPlateDiagramWells = ref<PlateWithPlateDiagramWells>()

const wellIdsToPoolFrom = ref<string[]>([])
const wellIdsToPoolTo = ref<string[]>([])

const unpooledPlateWellSpecs = ref<WellSpecs>({})
const pooledPlateWellSpecs = ref<WellSpecs>({})

const config = useRuntimeConfig()
const route = useRoute()
const toast = useToast()

const wellsToPoolFrom = computed(() => {
    return _.values(_.pick(unpooledPlateWellSpecs.value, wellIdsToPoolFrom.value))
})

const wellsToPoolFromContent = computed(() => {
    return wellsToPoolFrom.value.map(({data}) => {
        const wellContent = data.wellContents?.[0]?.nucleicAcid
        const wellContentType = data.wellContents?.[0]?.nucleicAcid ? 'DNA' : null
        return {
            content: wellContent,
            contentType: wellContentType,
        }
    })
})

onMounted(async() => {
    await refreshPlates()
})

const refreshPlates = async () => {
    await refreshPlate(route.params.unpooledPlateId as string, unpooledPlateWithWellContents, unpooledPlateWithPlateDiagramWells, unpooledPlateWellSpecs)
    await refreshPlate(route.params.pooledPlateId as string, pooledPlateWithWellContents, pooledPlateWithPlateDiagramWells, pooledPlateWellSpecs)
}

const refreshPlate = async (
    plateId: string,
    plateWithWellContents: Ref<PlateWithWellContents | undefined>,
    plateWithPlateDiagramWells: Ref<PlateWithPlateDiagramWells | undefined>,
    plateWellSpecs: Ref<WellSpecs>) =>
{
    plateWithWellContents.value = await RecordService.getRecord(
        `${config.public.apiBase}/plates`,
        plateId,
        {
            wells: {
                columns: {
                    id: true,
                    x: true,
                    y: true
                },
                with: {
                    wellContents: {
                        with: {
                            nucleicAcid: {
                                with: {
                                    pellet: true,
                                }
                            },
                        }
                    },
                }
            }
        }
    )
    if (plateWithWellContents.value) {
        updateWellSpecs(plateWellSpecs.value, plateWithWellContents.value)
        plateWithPlateDiagramWells.value = {
            ...plateWithWellContents.value,
            wells: _.values(plateWellSpecs.value),
        }
    }
}

const unpooledPlateWellRangeSelected = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'Selection Updated',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
    wellIdsToPoolFrom.value = _.map(wells, 'id')
}
const unpooledPlateWellSelectionCleared = () => {
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 1000,
    })
    wellIdsToPoolFrom.value = []
}
const unpooledPlateSelectAllWells = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'All Wells Selected',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
    wellIdsToPoolFrom.value = _.map(wells, 'id')
}
const unpooledPlateUpdatedWellContents = (event: any) => {
    console.log(event)
}
const pooledPlateWellRangeSelected = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'Selection Updated',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
    wellIdsToPoolTo.value = _.map(wells, 'id')
}
const pooledPlateWellSelectionCleared = () => {
    toast.add({
        severity: 'info',
        summary: 'Selection Cleared',
        detail: `You selected 0 wells`,
        life: 1000,
    })
    wellIdsToPoolTo.value = []
}
const pooledPlateSelectAllWells = (wells: PlateDiagramWell[]) => {
    toast.add({
        severity: 'info',
        summary: 'All Wells Selected',
        detail: `You selected ${wells.length} wells`,
        life: 1000,
    })
    wellIdsToPoolTo.value = _.map(wells, 'id')
}
const pooledPlateUpdatedWellContents = (event: any) => {
    console.log(event)
}

const poolSelectedWells = async () => {
    const sourceWellsIds = wellIdsToPoolFrom.value
    const destinationWellId = wellIdsToPoolTo.value[0]

    const oldUnpooledValues = _.values(_.pick(unpooledPlateWellSpecs.value, sourceWellsIds))
    const oldPooledValues = _.get(pooledPlateWellSpecs.value, destinationWellId)

    for (const sourceWell of wellsToPoolFrom.value) {
        // TODO: support (or prevent?) pooling of wells with mutliple contents
        const wellContentId = sourceWell.data.wellContents?.[0]?.id

        const updatedRecord = await RecordService.updateRecord(
            `${config.public.apiBase}/wellContents`,
            {
                id: wellContentId,
                wellId: destinationWellId,
            }
        )
    }
    await refreshPlates()
    const updatedPooledWell = _.get(pooledPlateWellSpecs.value, destinationWellId)
    const updatedUnpooledWells = _.values(_.pick(unpooledPlateWellSpecs.value, sourceWellsIds))

    if (updatedPooledWell) {
        pooledPlateDiagram.value.updateWells(
            [updatedPooledWell],
            [oldPooledValues]
        )
        unpooledPlateDiagram.value.updateWells(
            updatedUnpooledWells,
            oldUnpooledValues
        )
    }
}
</script>
<template>
    <div class="flex justify-center"><h3>Pooling</h3></div>
    <div class="flex flex-row justify-evenly">
        <PlateDiagram
            ref="unpooledPlateDiagram"
            v-if="unpooledPlateWithPlateDiagramWells"
            v-model="unpooledPlateWithPlateDiagramWells"
            :plateType="unpooledPlateWithPlateDiagramWells.plateType"
            @well-range-selected="unpooledPlateWellRangeSelected"
            @well-selection-cleared="unpooledPlateWellSelectionCleared"
            @all-wells-selected="unpooledPlateSelectAllWells"
            @well-contents-updated="unpooledPlateUpdatedWellContents" >
            <template #header>
                {{ unpooledPlateWithPlateDiagramWells?.name || '' }}
            </template>
        </PlateDiagram>
        <div class="flex flex-col justify-center">
            <Button
                icon="pi pi-arrow-right"
                severity="info"
                :class="wellIdsToPoolFrom && wellIdsToPoolFrom.length > 0 ? 'visible' : 'invisible'"
                :disabled="wellIdsToPoolTo && wellIdsToPoolTo.length != 1"
                @click="poolSelectedWells"
            />
        </div>
        <PlateDiagram
            ref="pooledPlateDiagram"
            v-if="pooledPlateWithPlateDiagramWells"
            v-model="pooledPlateWithPlateDiagramWells"
            :plateType="pooledPlateWithPlateDiagramWells.plateType"
            @well-range-selected="pooledPlateWellRangeSelected"
            @well-selection-cleared="pooledPlateWellSelectionCleared"
            @all-wells-selected="pooledPlateSelectAllWells"
            @well-contents-updated="pooledPlateUpdatedWellContents" >
            <template #header>
                {{ pooledPlateWithPlateDiagramWells?.name || '' }}
            </template>
        </PlateDiagram>
    </div>
    <div class="flex flex-col">
        <div class="flex justify-center" v-if="!_.isEmpty(wellsToPoolFrom)">
            <h5>Well contents</h5>
        </div>
        <div v-for="(item, i) in wellsToPoolFromContent">
            <div :key="i" class="flex flex-row">
                <div class="w-1/4 flex justify-center">
                    {{ item.contentType }}
                </div>
                <div class="w-3/4">
                    <div v-for="(value) in _.entries(item.content)">
                        {{ value[0] }} : {{ value[1] }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
