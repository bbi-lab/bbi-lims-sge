import _ from "lodash"
import { VALID_WELL_COLORS } from "~/composables/lib/plate-diagram"
import type { NucleicAcid } from "~/server/db/schema/sge/nucleic-acid"
import type { Pellet } from "~/server/db/schema/sge/pellet"
import type { Plate } from "~/server/db/schema/sge/plate"
import type { AmplificationPrimer, HomologyArmPrimer, LinearizationPrimer } from "~/server/db/schema/sge/primer"
import type { Well, WellContent } from "~/server/db/schema/sge/well"

export type PlateDiagramColorMap = {
    [key: string]: {
        color: string
        group: string
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
    },
    'lin-storage':{
        selectionTableName: 'linearization-primers',
        wellContentsKey: 'linearizationPrimer',
        wellContentsFK: 'linearizationPrimerId',
    },
    'ha-storage':{
        selectionTableName: 'homology-arm-primers',
        wellContentsKey: 'homologyArmPrimer',
        wellContentsFK: 'homologyArmPrimerId',
    },
    'pcr-1':{
        selectionTableName: 'nucleic-acids',
        wellContentsKey: 'nucleicAcid',
        wellContentsFK: 'nucleicAcidId',
    },
    'pcr-2':{
        selectionTableName: 'nucleic-acids',
        wellContentsKey: 'nucleicAcid',
        wellContentsFK: 'nucleicAcidId',
    },
    'pcr-3':{
        selectionTableName: 'nucleic-acids',
        wellContentsKey: 'nucleicAcid',
        wellContentsFK: 'nucleicAcidId',
    },
}

export const updateColorMap = (colorMap: PlateDiagramColorMap, plate: PlateWithWellContents) => {
    const wellContentsKey = _.get(PLATE_TYPE_SPECS, [plate.plateType, 'wellContentsKey'])
    const wellContentsFK = _.get(PLATE_TYPE_SPECS, [plate.plateType, 'wellContentsFK'])

    // remove values from color map that are not in the plate
    _.forEach(_.keys(colorMap), (key) => {
        if (!_.some(plate.wells, (well: WellWithContents) => _.get(well, ['wellContents', 0, wellContentsKey, 'id']) === key)) {
            delete colorMap[key]
        }
    })

    // add new values to color map
    const usedColorIndexes = _.map(_.values(colorMap), ({color}) => {
        return _.indexOf(VALID_WELL_COLORS, color)
    })
    let currentColorIndex = _.max(usedColorIndexes) ?? -1

    plate.wells.forEach((well: WellWithContents) => {
        const wellContents = _.get(well, ['wellContents', 0, wellContentsKey])
        if (_.get(well, ['wellContents', 0, wellContentsFK]) && !_.has(colorMap, wellContents.id)) {
            const sameGroupColor = wellContents.name ? _.find(_.values(colorMap), (value) => value.group === _.replace(wellContents.name, /_[frFR]$/, ''))?.color : undefined
            if (!sameGroupColor) currentColorIndex += 1
            _.set(colorMap, wellContents.id, {
                color: sameGroupColor || VALID_WELL_COLORS[currentColorIndex % VALID_WELL_COLORS.length],
                group: wellContents.name ? _.replace(wellContents.name, /_[frFR]$/, '') : undefined
            })
        }
    })
}
