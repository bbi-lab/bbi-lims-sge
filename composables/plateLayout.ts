import type { PlateWithWellContents, } from "~/utils/sge/plateUtils"
import _ from "lodash"
import { VALID_WELL_COLORS, type PlateDiagramWell } from "~/lib/plate-diagram"
import { RecordService } from "~/utils/service/RecordService"
import type { Well, WellContent } from "~/server/db/schema/sge/well"

type WellSpecs = {
    [key: string]: {
        id: string
        x: number
        y: number
        colorByValues: string[]
        selectionTableRecordIds: string[]
        color: string
        tooltip: string
        symbol: string
        data: Well & {
            wellContents: WellContent[]
        }
    }
}

interface wellContentDisplayConfig {
    colorByPaths?: _.PropertyPath[] // array of paths of well content properties to color by
    selectionTableRecordIdPaths?: _.PropertyPath[] // array of paths of well content properties that correspond to selection table record IDs
    symbol?: Function | null
    tooltip?: Function | null
}

export const usePlateLayout = (plateId: string) => {
    const plateWithWellContents = ref<PlateWithWellContents>()
    const wellContentsDisplayConfig = ref<wellContentDisplayConfig>()
    const wellSpecs = ref<WellSpecs>({})
    const selectedWells = ref<PlateDiagramWell[]>([])
    const toast = useToast()
    const config = useRuntimeConfig()
    const { showLoginModal } = useLayout()
    const wellContentsWithClause = ref()
    const plateDiagramRef = ref()
    const selectionTableRef = ref()

    const setSelectionTableRef = (el: any) => {
        selectionTableRef.value = el
    }
    const setPlateDiagramRef = (el: any) => {
        plateDiagramRef.value = el
    }
    const plateWithPlateDiagramWells = computed(() => {
        return {
            ...plateWithWellContents.value,
            wells: _.values(wellSpecs.value),
        }
    })

    const loadPlate = async (contentsWithClause?: any) => {
        wellContentsWithClause.value = contentsWithClause || {}
        try {
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
                                with: wellContentsWithClause.value,
                            },
                        },
                    },
                }
            )
        } catch (error: any) {
            if (error.statusCode == 401 && error.statusMessage == 'TOKEN EXPIRED') {
                showLoginModal()
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
            }
            return
        }
        updateWellSpecs()
    }

    const getWellSpecBySelectionTableRecordId = (selectionTableRecordId: string) => {
        return _.find(_.values(wellSpecs.value), (wellSpec) => {
            return _.includes(wellSpec.selectionTableRecordIds, selectionTableRecordId)
        })
    }

    const nextColorToUse = computed(() => {
        const colorCounts = _.countBy(_.values(_.filter(wellSpecs.value, 'color')), 'color')
        const unusedColors = _.difference(VALID_WELL_COLORS, _.keys(colorCounts))
        unusedColors.forEach((color) => {
            colorCounts[color] = 0
        })
        return _.minBy(_.keys(colorCounts), (color) => colorCounts[color])
    })

    const updateWellSpecs = () => {
        if (!plateWithWellContents.value) return

        plateWithWellContents.value.wells.forEach((well) => {
            // remove empty wells from color map
            if (_.isEmpty(well.wellContents)) {
                _.unset(wellSpecs.value, well.id)
            }

            const contentsToColorBy = _.compact(_.flatten(_.map(well.wellContents, (wellContent) => {
                return _.map(wellContentsDisplayConfig.value?.colorByPaths, (x) => _.get(wellContent, x))
            }))).sort()

            const selectionTableRecordIds = _.compact(_.flatten(_.map(well.wellContents, (wellContent) => {
                return _.map(wellContentsDisplayConfig.value?.selectionTableRecordIdPaths, (x) => _.get(wellContent, x))
            }))).sort()

            const existingWellSpec = _.get(wellSpecs.value, well.id)

            // if well contents foreign keys have not changed, leave color unchanged
            let wellColor
            const wellSpecWithSameContentsToColorBy = _.find(_.values(wellSpecs.value), (x) => _.isEqual(x.colorByValues, contentsToColorBy))
            if (existingWellSpec && _.isEqual(contentsToColorBy, existingWellSpec.colorByValues)) {
                wellColor = existingWellSpec.color
            } else if (wellSpecWithSameContentsToColorBy) {
                wellColor = _.get(wellSpecWithSameContentsToColorBy, 'color')
            } else if (!_.isEmpty(contentsToColorBy)) {
                wellColor = nextColorToUse.value
            } else {
                wellColor = null // no color if no contents to color by
            }

            // set data
            _.set(wellSpecs.value, well.id, {
                id: well.id,
                x: well.x,
                y: well.y,
                data: well,
                colorByValues: contentsToColorBy,
                selectionTableRecordIds: selectionTableRecordIds,
                color: wellColor,
                tooltip: wellContentsDisplayConfig.value?.tooltip ? wellContentsDisplayConfig.value.tooltip(well) : '',
                symbol: wellContentsDisplayConfig.value?.symbol ? wellContentsDisplayConfig.value.symbol(well) : '',
            })
        })
    }

    const emptySelectedWells = async () => {
        const oldValues = _.values(_.pick(wellSpecs.value, _.map(selectedWells.value, 'id')))
        const wellContentsToDelete = _.flatten(_.compact(_.map(selectedWells.value, (x) => {
            return _.get(x, 'data.wellContents')
        })))
        let deletedRecords: WellContent[]
        try {
            deletedRecords = await RecordService.deleteRecords(
                `${config.public.apiBase}/well-contents`,
                wellContentsToDelete
            )
        } catch (error: any) {
            if (error.statusCode == 401 && error.statusMessage == 'TOKEN EXPIRED') {
                showLoginModal()
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
            }
            return
        }
        if (!_.isEmpty(deletedRecords)) {
            await loadPlate(wellContentsWithClause.value)
            const deletedWellIds = _.uniq(_.map(deletedRecords, (deletedRecord) => deletedRecord.wellId))
            const updatedWells = _.values(_.pick(wellSpecs.value, deletedWellIds))
            // Update the plate diagram with the new well specs
            plateDiagramRef.value.updateWells(updatedWells, oldValues)

            toast.add({
                severity: 'info',
                summary: 'Updated well',
                detail: `Emptied ${_.size(updatedWells)} wells`,
                life: 1000,
            })
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error emptying wells',
                life: 1000,
            })
        }
    }

    const updatedWellContents = async function(newValues: PlateDiagramWell[], oldValues: PlateDiagramWell[]) {
        await loadPlate(wellContentsWithClause.value)

        // plateDiagramRef.value.updateWells(newValues, oldValues)

        const selectionTableIdsToRefresh = _.compact([
            ..._.flatten(_.map(newValues || [], 'selectionTableRecordIds')),
            ..._.flatten(_.map(oldValues || [], 'selectionTableRecordIds')),,
        ])

        selectionTableIdsToRefresh.forEach((id) => {
            selectionTableRef.value.addOrRefreshRecordId(id)
        })
        // forces frozen records to be re-evaluated when the well contents are being cleared
        selectedWells.value = _.filter(plateWithPlateDiagramWells.value?.wells, (x) => {
            return _.includes(_.map(newValues, 'id'), x.id)
        })
    }

    const assignIdToSelectedWells = async (id: string, column: 'amplificationPrimerId' | 'linearizationPrimerId' | 'homologyArmPrimerId' | 'indexPrimerId' | 'nucleicAcidId' | 'pelletId') => {
        const oldValues = _.values(_.pick(wellSpecs.value, _.map(selectedWells.value, 'id')))
        const recordsToAdd = _.map(selectedWells.value, (well) => {
            return {
                wellId: well.id,
                [column]: id,
            }
        })
        let newRecords: WellContent[] = []
        try {
            newRecords = await RecordService.addRecords(
                `${config.public.apiBase}/well-contents`,
                recordsToAdd
            ) as WellContent[]
        } catch (error: any) {
            if (error.statusCode == 401 && error.statusMessage == 'TOKEN EXPIRED') {
                showLoginModal()
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: error.statusMessage, life: 3000 })
            }
            return
        }
        if (!_.isEmpty(newRecords)) {
            await loadPlate(wellContentsWithClause.value)
            const updatedWellIds = _.uniq(_.map(newRecords, 'wellId'))
            const updatedWells = _.values(_.pick(wellSpecs.value, updatedWellIds))

            // Update the plate diagram with the new well specs
            plateDiagramRef.value.updateWells(updatedWells, oldValues)
        }
        return newRecords
    }

    const wellRangeSelected = function(wells: PlateDiagramWell[]) {
        selectedWells.value = _.filter(plateWithPlateDiagramWells.value?.wells, (x) => {
            return _.includes(_.map(wells, 'id'), x.id)
        })
    }

    const selectedAllWells = function(wells: PlateDiagramWell[]) {
        selectedWells.value = wells
    }
    const wellSelectionCleared = function() {
        selectedWells.value = []
    }

    return {
        plateWithWellContents,
        wellContentsDisplayConfig,
        wellSpecs,
        selectedWells,
        plateDiagramRef,
        getWellSpecBySelectionTableRecordId,
        updateWellSpecs,
        wellRangeSelected,
        selectedAllWells,
        wellSelectionCleared,
        loadPlate,
        emptySelectedWells,
        updatedWellContents,
        setPlateDiagramRef,
        setSelectionTableRef,
        assignIdToSelectedWells,
    }
}
