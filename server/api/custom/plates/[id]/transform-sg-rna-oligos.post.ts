import { eq, inArray } from "drizzle-orm"
import { wellContents, wellContentSources, wells } from "~/server/db/schema/sge/well"
import _ from "lodash"
import { wellCoordinateToChar } from "~/lib/plate-diagram"
import { sgRnaPlasmids } from "~/server/db/schema/sge/plasmid"
import { sgRnaCloningExperiments } from "~/server/db/schema/sge/plasmid-experiment"
import { plates } from "~/server/db/schema/sge/plate"


interface plasmidsToCreate {
    name: string,
    targetId: string,
    wellId: string,
    wellContentIds: string[],
}

export default defineEventHandler(async (event) => {
    const { id: plateId } = event.context.params as {id: string}

    try {
        const body = await readBody(event)

        const plate = await db.query.plates.findFirst({
            where: eq(plates.id, plateId),
        })
        const wellsWithOligoContents = await db.query.wells.findMany({
            with: {
                wellContents: {
                   with: {
                        oligo: true,
                   }
               }
            },
            where: eq(wells.plateId, plateId),
        })


        const plasmidsToCreate: plasmidsToCreate[] = _.compact(_.map(_.filter(wellsWithOligoContents, (x) => !_.isEmpty(x.wellContents)), (well) => {
            const oligos = _.compact(_.map(well.wellContents, 'oligo'))
            const wellCoordinates = `${wellCoordinateToChar(well.y)}${well.x}`

            if (oligos.length === 0) {
                return null
            }  if (oligos.length !== 2) {
                throw createError({
                    statusCode: 400,
                    statusMessage: `Expected 2 oligos in well ${wellCoordinates}, found ${oligos.length}`,
                })
            } else {
                const oligosCombined = _.uniqBy(_.map(oligos, (x) => {
                    return {
                        name: x.name.replace(/_[W|C]$/, ''),
                        targetId: x.targetId,
                    }
                }), ['name', 'targetId'])

                if (oligosCombined.length !== 1) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: `Mismatched names or targets for oligos in well ${wellCoordinates}`,
                    })
                } else {
                    return {
                        name: oligosCombined[0].name,
                        targetId: oligosCombined[0].targetId,
                        wellId: well.id,
                        wellContentIds: _.map(well.wellContents, 'id'),
                    }
                }
            }
        }))


        const result = await db.transaction(async (tx) => {
            for (const plasmid of plasmidsToCreate) {
                try {
                    if (!plasmid) continue
                    const newPlasmid = await tx.insert(sgRnaPlasmids).values({name: plasmid.name, targetId: plasmid.targetId}).returning({ id: sgRnaPlasmids.id })
                    await tx.delete(wellContentSources).where(inArray(wellContentSources.wellContentId, plasmid.wellContentIds))
                    await tx.delete(wellContents).where(eq(wellContents.wellId, plasmid.wellId))
                    await tx.insert(wellContents).values({
                        wellId: plasmid.wellId,
                        sgRnaPlasmidId: newPlasmid[0].id,
                    })
                } catch (error: any) {
                    throw new Error(`Failed to create plasmid ${plasmid.name}: ${error.message}`)
                }
            }
            await tx.update(sgRnaCloningExperiments)
                .set({ transformed: true })
                .where(eq(sgRnaCloningExperiments.id, plate?.sgRnaCloningExperimentId as string))
        })
        return result
    } catch (error: any) {
        throw createError({
            statusCode: 400,
            statusMessage: error.message
        })
    }
})
