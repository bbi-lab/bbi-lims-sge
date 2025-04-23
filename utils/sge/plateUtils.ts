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

export const updateColorMap = (colorMap: PlateDiagramColorMap, plate: PlateWithWellContents) => {
    // Amplification Primer storage plate
    if (plate.plateType == 'amp-storage') {
        // remove values from color map that are not in the plate
        _.forEach(_.keys(colorMap), (key) => {
            if (!_.some(plate.wells, (well: WellWithContents) => well.wellContents[0]?.amplificationPrimer?.id === key)) {
                delete colorMap[key]
            }
        })

        // add new values to color map
        const usedColorIndexes = _.map(_.values(colorMap), ({color}) => {
            return _.indexOf(VALID_WELL_COLORS, color)
        })
        let currentColorIndex = _.max(usedColorIndexes) ?? -1

        plate.wells.forEach((well: WellWithContents) => {
            if (well.wellContents[0]?.amplificationPrimer && !_.has(colorMap, well.wellContents[0]?.amplificationPrimer.id)) {
                const sameGroupColor = _.find(_.values(colorMap), (value) => value.group === _.replace(well.wellContents[0]?.amplificationPrimer.name, /_[frFR]$/, ''))?.color
                if (!sameGroupColor) currentColorIndex += 1
                _.set(colorMap, well.wellContents[0]?.amplificationPrimer.id, {
                    color: sameGroupColor || VALID_WELL_COLORS[currentColorIndex % VALID_WELL_COLORS.length],
                    group: _.replace(well.wellContents[0]?.amplificationPrimer.name, /_[frFR]$/, '')
                })
            }
        })
    } else if (plate.plateType.startsWith('pcr-')) {
        // remove values from color map that are not in the plate
        _.forEach(_.keys(colorMap), (key) => {
            if (!_.some(plate.wells, (well: WellWithContents) => well.wellContents[0]?.nucleicAcid?.id === key)) {
                delete colorMap[key]
            }
        })
        // add new values to color map
        const usedColorIndexes = _.map(_.values(colorMap), ({color}) => {
            return _.indexOf(VALID_WELL_COLORS, color)
        })
        let currentColorIndex = _.max(usedColorIndexes) ?? -1

        plate.wells.forEach((well: WellWithContents) => {
            if (well.wellContents[0]?.nucleicAcid && !_.has(colorMap, well.wellContents[0]?.nucleicAcid.id)) {
                currentColorIndex += 1
                _.set(colorMap, well.wellContents[0]?.nucleicAcid.id, {
                    color: VALID_WELL_COLORS[currentColorIndex % VALID_WELL_COLORS.length],
                })
            }
        })
    }
}
