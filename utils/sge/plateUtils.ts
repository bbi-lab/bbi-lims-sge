import _ from "lodash"
import { VALID_WELL_COLORS, wellCoordinateToChar, type PlateDiagramWell } from "~/composables/lib/plate-diagram"
import type { NucleicAcid } from "~/server/db/schema/sge/nucleic-acid"
import type { Pellet } from "~/server/db/schema/sge/pellet"
import type { Plate } from "~/server/db/schema/sge/plate"
import type { AmplificationPrimer, HomologyArmPrimer, LinearizationPrimer } from "~/server/db/schema/sge/primer"
import type { Well, WellContent } from "~/server/db/schema/sge/well"
import { RecordService } from "../service/RecordService"

export type PlateDiagramColorMap = {
    [key: string]: {
        color: string
        group: string
        wellIds: string[]
    }
}

export type WellSpecs = {
    [key: string]: {
        id: string
        x: number
        y: number
        contentFKs: string[]
        contentGroupId: string
        color: string
        tooltip: string
        symbol: string
        data: Well & {
            wellContents: WellContent[]
        }
    }
}

export type WellWithContents = Well & {
    wellContents: WellContent & {
        amplificationPrimer: AmplificationPrimer
        linearizationPrimer: LinearizationPrimer
        homologyArmPrimer: HomologyArmPrimer
        nucleicAcid: NucleicAcid & {
            pellet: Pellet
        }
    }[]
}

export type PlateWithWellContents = Plate & {
    wells: WellWithContents[]
}

type NucleicAcidWithPellet = NucleicAcid & {pellet: Pellet}

export const PLATE_TYPE_SPECS = {
    'amp-storage':{
        selectionTableName: 'amplification-primers',
        wellContentsKey: 'amplificationPrimer',
        wellContentsFK: 'amplificationPrimerId',
        wellContentTypeShortName: 'AMP',
    },
    'lin-storage':{
        selectionTableName: 'linearization-primers',
        wellContentsKey: 'linearizationPrimer',
        wellContentsFK: 'linearizationPrimerId',
        wellContentTypeShortName: 'LIN',
    },
    'ha-storage':{
        selectionTableName: 'homology-arm-primers',
        wellContentsKey: 'homologyArmPrimer',
        wellContentsFK: 'homologyArmPrimerId',
        wellContentTypeShortName: 'HA',
    },
    'preseq-1':{
        selectionTableName: 'nucleic-acids',
        wellContentsKey: 'nucleicAcid',
        wellContentsFK: 'nucleicAcidId',
        wellContentTypeShortName: 'DNA',
    },
    'preseq-2':{
        selectionTableName: 'view-plates-with-well-counts',
        wellContentsKey: 'nucleicAcid',
        wellContentsFK: 'nucleicAcidId',
        wellContentTypeShortName: 'DNA',
    },
    'preseq-3':{
        selectionTableName: 'nucleic-acids',
        wellContentsKey: 'nucleicAcid',
        wellContentsFK: 'nucleicAcidId',
        wellContentTypeShortName: 'DNA',
    },
    'seq-index':{
        selectionTableName: 'index-primers',
        wellContentsKey: 'indexPrimer',
        wellContentsFK: 'indexPrimerId',
        wellContentTypeShortName: 'INDEX',
    },
}

export const updateWellSpecs = (wellSpecs: WellSpecs, plate: PlateWithWellContents) => {
    const wellContentsKey = _.get(PLATE_TYPE_SPECS, [plate.plateType, 'wellContentsKey'])
    const wellContentsFK = _.get(PLATE_TYPE_SPECS, [plate.plateType, 'wellContentsFK'])
    const wellContentTypeShortName = _.get(PLATE_TYPE_SPECS, [plate.plateType, 'wellContentTypeShortName'])
    const wellContentNamePath = _.includes(['preseq-1', 'preseq-2', 'preseq-3'], plate.plateType) ?
        'pellet.name' :
        (plate.plateType == 'seq-index' ? 'indexSequence' : 'name')

    const wellContentGroupIdPath = _.includes(['ha-storage', 'amp-storage', 'lin-storage'], plate.plateType) ?
        [wellContentsKey, 'targetId'] :
        _.includes(['preseq-1'], plate.plateType) ?
        [wellContentsKey, 'pellet', 'id'] :
        undefined

    // remove empty wells from color map
    _.forEach(plate.wells, (well: WellWithContents) => {
        if (_.isEmpty(well.wellContents)) {
            delete wellSpecs[well.id]
        }
    })

    // get max index of used colors
    const usedColorIndexes = _.map(_.values(wellSpecs), ({color}) => {
        return _.indexOf(VALID_WELL_COLORS, color)
    })
    let currentColorIndex = _.max(usedColorIndexes) ?? -1

    // update well specs
    plate.wells.forEach((well: WellWithContents) => {
        const wellContentFKs = _.compact(_.map(well.wellContents, (wellContent) => {
            return _.get(wellContent, wellContentsFK)
        })).sort()

        // if well contents foreign keys have not changed, skip
        const existingWellSpec = _.get(wellSpecs, well.id)
        if (existingWellSpec && _.isEqual(wellContentFKs, existingWellSpec.contentFKs)) return

        // set data
        _.set(wellSpecs, well.id, {
            id: well.id,
            x: well.x,
            y: well.y,
            data: well,
        })
        if (_.isEmpty(well.wellContents)) return


        _.set(wellSpecs, [well.id, 'contentFKs'], wellContentFKs)
        const existingColorMapEntry = _.get(wellSpecs, well.id)

        // set content group id if applicable
        // for ha-storage, amp-storage, lin-storage, the content group id is the targetId of the wellContent
        const wellContentGroupId = wellContentGroupIdPath ? _.get(well.wellContents, [0, ...wellContentGroupIdPath]) : undefined
        _.set(wellSpecs, [well.id, 'contentGroupId'], wellContentGroupId)

        // set color
        if (wellContentGroupId) {
            const groupColor = _.find(_.values(wellSpecs), (value) => value.contentGroupId === wellContentGroupId)?.color
            if (groupColor) {
                _.set(wellSpecs, [well.id, 'color'], groupColor)
            } else {
                currentColorIndex += 1
                _.set(wellSpecs, [well.id, 'color'], VALID_WELL_COLORS[currentColorIndex % VALID_WELL_COLORS.length])
            }
        } else if (wellContentFKs && wellContentFKs !== existingColorMapEntry?.contentFKs) {
            // update entry
            const existingEntryWithSameContentIds = _.find(_.values(wellSpecs), (value) => value.contentFKs === wellContentFKs)
            if (!existingEntryWithSameContentIds) currentColorIndex += 1
            _.set(wellSpecs, [well.id, 'color'], existingEntryWithSameContentIds?.color || VALID_WELL_COLORS[currentColorIndex % VALID_WELL_COLORS.length])
        }

        // set tooltip
        const wellTooltips = _.compact(_.map(well.wellContents, (x) => {
            const wellContent = _.get(x, wellContentsKey)
            return wellContent ? `${_.get(wellContent, wellContentNamePath)} (${wellContentTypeShortName})` : null
        }))

        _.set(wellSpecs, [well.id, 'tooltip'], `${wellCoordinateToChar(well.y)}${well.x}:<br>${wellTooltips.join('<br>')}`)

        // set symbol
        if (_.includes(['amp-storage', 'lin-storage', 'ha-storage'], plate.plateType)) {
            const wellContent = _.get(well, ['wellContents', 0, wellContentsKey])
            _.set(wellSpecs, [well.id, 'symbol'], _.upperCase(_.get(wellContent, 'sequenceType.0')))
        }
    })
}

export const assignNucleicAcidsToPreseq1Plate = async (nucleicAcids: NucleicAcidWithPellet[], plate: PlateWithWellContents, apiBase: string) => {
    const wellContentsAdded = []
    let lastColumnPopulated = 0

    // should be only one negative control
    const negativeControl = _.find(nucleicAcids, (nucleicAcid) => {
        return nucleicAcid.pellet.transfections?.length == 1 && nucleicAcid.pellet.transfections[0] == 'NC'
    })

    if (negativeControl) {
        // assign to the first column (8 wells)
        const wellsToAssignTo = _.filter(plate.wells, (well) => well.x == 1)
        const wellContentsToAdd = _.map(wellsToAssignTo, (well) => {
            return {
                wellId: well.id,
                nucleicAcidId: negativeControl.id,
            }
        })
        const wellContents = await RecordService.addRecords(`${apiBase}/well-contents`, wellContentsToAdd) as WellContent[]
        wellContentsAdded.push(...wellContents)
        lastColumnPopulated++
    }

    const dayFiveNucleicAcids = _.sortBy(_.filter(nucleicAcids, (nucleicAcid) => {
        return nucleicAcid.pellet.harvestDay == 5 && !_.includes(nucleicAcid.pellet.transfections, 'NC')
    }), (x) => x.pellet.name)

    for (const dayFiveNucleicAcid of dayFiveNucleicAcids) {
        // assign each to one column (8 wells)
        const wellsToAssignTo = _.filter(plate.wells, (well) => well.x == lastColumnPopulated + 1)
        const wellContentsToAdd = _.map(wellsToAssignTo, (well) => {
            return {
                wellId: well.id,
                nucleicAcidId: dayFiveNucleicAcid.id,
            }
        })
        const wellContents = await RecordService.addRecords(`${apiBase}/well-contents`, wellContentsToAdd) as WellContent[]
        wellContentsAdded.push(...wellContents)
        lastColumnPopulated++
    }

    const dayThirteenNucleicAcids = _.sortBy(_.filter(nucleicAcids, (nucleicAcid) => {
        return nucleicAcid.pellet.harvestDay == 13 && !_.includes(nucleicAcid.pellet.transfections, 'NC')
    }), (x) => x.pellet.name)

    for (const dayThirteenNucleicAcid of dayThirteenNucleicAcids) {
        // assign each to 2 columns (16 wells)
        const wellsToAssignTo = _.filter(plate.wells, (well) => well.x > lastColumnPopulated && well.x <= lastColumnPopulated + 2)
        const wellContentsToAdd = _.map(wellsToAssignTo, (well) => {
            return {
                wellId: well.id,
                nucleicAcidId: dayThirteenNucleicAcid.id,
            }
        })
        const wellContents = await RecordService.addRecords(`${apiBase}/well-contents`, wellContentsToAdd) as WellContent[]
        wellContentsAdded.push(...wellContents)
        lastColumnPopulated = lastColumnPopulated + 2
    }

    return wellContentsAdded
}

export const poolPreseq1PlateToWells = async (plateId: string, selectedWells: PlateDiagramWell[], apiBase: string) => {
    // sort wells by x and inverse y coordinate to achieve the correct order
    const sortedWellIds = _.map(_.sortBy(selectedWells, (well) => `${_.padStart(_.toString(well.x), 2, '0')}_${(_.toString(100-well.y))}`), 'id')

    const preseq1Plate = await RecordService.getRecord(`${apiBase}/plates`, plateId, {
        wells: {
            columns: {id: true},
            with: {
                wellContents: {
                    columns: {id: true},
                    with: {
                        nucleicAcid: {
                            columns: {id: true},
                            with: {
                                pellet: {
                                    columns: {id: true, name: true, isBackup: true},
                                },
                            },
                        },
                    },
                },
            },
        }
    }) as PlateWithWellContents

    const pooledNucleicAcids = _.sortBy(_.values(preseq1Plate.wells.reduce((acc, well: WellWithContents) => {
        const nucleicAcid = _.get(well, ['wellContents', 0, 'nucleicAcid'])
        if (nucleicAcid?.id && !_.has(acc, nucleicAcid.id)) {
            _.set(acc, nucleicAcid.id, nucleicAcid)
        }
        return acc
    }, {})), (x) => {
        return x.pellet.name
    }) as NucleicAcidWithPellet[]

    if (pooledNucleicAcids.length > sortedWellIds.length) {
        throw new Error('Number of selected wells is less than number of nucleic acids in the plate')
    } else {
        return _.map(pooledNucleicAcids, (value, index) => {
          return {
            wellId: sortedWellIds[index],
            nucleicAcidId: value.id,
          }
        })
    }
}
