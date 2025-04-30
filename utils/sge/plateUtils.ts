import _ from "lodash"
import { VALID_WELL_COLORS, wellCoordinateToChar } from "~/composables/lib/plate-diagram"
import type { NucleicAcid } from "~/server/db/schema/sge/nucleic-acid"
import type { Pellet } from "~/server/db/schema/sge/pellet"
import type { Plate } from "~/server/db/schema/sge/plate"
import type { AmplificationPrimer, HomologyArmPrimer, LinearizationPrimer } from "~/server/db/schema/sge/primer"
import type { Well, WellContent } from "~/server/db/schema/sge/well"

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
        selectionTableName: 'nucleic-acids',
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
}

export const updateWellSpecs = (wellSpecs: WellSpecs, plate: PlateWithWellContents) => {
    const wellContentsKey = _.get(PLATE_TYPE_SPECS, [plate.plateType, 'wellContentsKey'])
    const wellContentsFK = _.get(PLATE_TYPE_SPECS, [plate.plateType, 'wellContentsFK'])
    const wellContentTypeShortName = _.get(PLATE_TYPE_SPECS, [plate.plateType, 'wellContentTypeShortName'])
    const wellContentNamePath = _.includes(['preseq-1', 'preseq-2', 'preseq-3'], plate.plateType) ? 'pellet.name' : 'name'

    const wellContentGroupIdPath = _.includes(['ha-storage', 'amp-storage', 'lin-storage'], plate.plateType) ? [wellContentsKey, 'targetId'] : undefined

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
