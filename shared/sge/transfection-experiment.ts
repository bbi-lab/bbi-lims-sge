
import { transfectExperiments, transfectTargets } from '../../server/db/schema/sge/transfect-experiment'
import { pellets } from '../../server/db/schema/sge/pellet'

import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { dateSchema } from '../../server/db/helpers/schemas'
import { z } from 'zod'
import _ from 'lodash'
import type { DBQueryConfig } from 'drizzle-orm'
import { eq, inArray, ne } from 'drizzle-orm'

const baseUrl = '/api/transfect-experiments'
const pelletsUrl = '/api/pellets'

const transfectionExperimentSelect = createSelectSchema(transfectExperiments, {startedOn: dateSchema})
const transfectionExperimentUpdate = transfectionExperimentSelect.omit({id: true}).optional()
type TransfectionExperimentSelect = z.infer<typeof transfectionExperimentSelect>
type TransfectionExperimentUpdate = z.infer<typeof transfectionExperimentUpdate>

const pelletInsert = createInsertSchema(pellets)
type PelletInsert = z.infer<typeof pelletInsert>

const pelletSelect = createSelectSchema(pellets)
type PelletSelect = z.infer<typeof pelletSelect>
// type for pellet plus transfection target ID
export type TranfectionExperimentPellet = PelletSelect & {
    transfectTargetId: string
}
const transfectionTargetSelect = createSelectSchema(transfectTargets)
type TransfectionTargetSelect = z.infer<typeof transfectionTargetSelect>
// type for target minus pellets
type TranfectionExperimentTarget = TransfectionTargetSelect & {
    target: {
        name: string
        negativeControl: boolean
        region: {
            name: string
            gene: {
                symbol: string
            }
        }
    }
}
type IdOnly = {id: string}

// export const VALID_REPLICATES = ['NC', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9']
export const VALID_TRANSFECTIONS = ['NC', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9']

export class TransfectionExperiment {
    id?: string
    data?: TransfectionExperimentUpdate

    name?: string

    // related data
    transfectTargets?: TranfectionExperimentTarget[]
    pellets?: TranfectionExperimentPellet[]

    constructor(val?: string | TransfectionExperimentUpdate) {
        if (!_.isObject(val)) {
            this.id = val
        } else {
            this.data = val
        }
    }

    // assign values and save to database
    async update(values: TransfectionExperimentUpdate) {
        Object.assign(this, values)
        return await this.save()
    }

    // fetch instance from db and populate values
    async fetch() {
        const fetchQuery = {
            query: {
                with: {
                    cycle: {
                        columns: {name: true},
                    },
                    transfectTargets: {
                        columns: {
                            id: true,
                            transfectionCount: true,
                            negativeControl: true,
                        },
                        with: {
                            pellets: {
                                columns: {
                                    id: true,
                                    name: true,
                                    harvestDay: true,
                                    transfections: true,
                                },
                            },
                            target: {
                                columns: {name: true},
                                with: {
                                    region: {
                                        columns: {name: true},
                                        with: {
                                            gene: {
                                                columns: {symbol: true}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                }
            }
        }

        const data = await $fetch(`${baseUrl}/${this.id}`, fetchQuery)
        if (!data) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found'
            })
        }
        if (transfectionExperimentSelect.safeParse(data).success) {
            this.data = transfectionExperimentSelect.parse(data)

            if (_.has(data, 'cycle')) {
                this.name = _.get(data, 'cycle.name', '')
            }
            if (_.has(data, 'transfectTargets')) {
                this.pellets = _.compact(
                    _.flatten(
                        _.map(
                            data.transfectTargets, (x: any) => _.map(x.pellets, (pellet) => {
                                return {...pellet, transfectTargetId: x.id}  as TranfectionExperimentPellet
                            })
                        )
                    )
                )
                this.transfectTargets = _.map(data.transfectTargets, (x) => {
                    _.unset(x, 'pellets')
                    return x
                })
            }
            return {success: true}
        }
    }

    // commit new experiment to db
    async create() {
        if (this.data) {
            const response = await $fetch<TransfectionExperimentSelect[]>(baseUrl, {method: 'POST', body: [this.data]})
            if (response.length == 1) {
                if (transfectionExperimentSelect.safeParse(response[0]).success) {
                    const {id, ...data} = response[0]
                    Object.assign(this, {id, data})
                }
                return {success: true}
            } else {
                return {success: false}
            }
        }
    }

    // update existing experiment in db
    async save() {
        if (this.data) {
            const response = await $fetch<TransfectionExperimentSelect>(`${baseUrl}/${this.id}`, {method: 'PUT', body: this.data})
            if (response.id) {
                const {id, ...data} = response
                Object.assign(this, data)
                if (_.isArray(this.transfectTargets)) {
                    await this.saveTargets()
                }
                return {success: true}
            }
        }
    }

    // delete experiment from db
    async delete() {
        const data = await $fetch<IdOnly>(`${baseUrl}/${this.id}`, {method: 'DELETE'})
        if (data.id) {
            this.data = undefined
            this.id = undefined
            this.transfectTargets = undefined
            return {success: true}
        }
    }

    // update related M:M records in db
    async saveTargets() {
        if (this.id && _.isArray(this.transfectTargets)) {
            const targetIds = _.map(this.transfectTargets, (x) => _.get(x, 'targetId', ''))

            const existingTargets = await db.select({targetId: transfectTargets.targetId})
                .from(transfectTargets)
                .where(eq(transfectTargets.experimentId, this.id))

            const existingTargetIds =  _.map(existingTargets, (x) => x.targetId)
            const targetsToRemove = _.difference(existingTargetIds, targetIds)
            const targetsToAdd = _.difference(targetIds, existingTargetIds)

            if (targetsToAdd?.length > 0)
                await db.insert(transfectTargets).values(_.map(targetsToAdd, (x) => { return {targetId: x, experimentId: this.id as string}}))
            if (targetsToRemove?.length > 0)
                await db.delete(transfectTargets).where(inArray(transfectTargets.targetId, targetsToRemove))
        }
    }

    async addPellets(pellets: PelletInsert[]) {
        const {data} = await useFetch<PelletSelect[]>(pelletsUrl, {method: 'POST', body: pellets})

        if (data.value) {
            return {success: true, data: data.value}
        } else {
            return {success: false}
        }
    }

    async deletePellets(pelletIds: string[]) {
        const deletedPellets: PelletSelect[] = []
        for (const pelletId of pelletIds) {
            const {data} = await useFetch<PelletSelect>(`${pelletsUrl}/${pelletId}`, {method: 'DELETE'})
            if (data.value) {
                deletedPellets.push(data.value)
            }
        }
        if (!_.isEmpty(deletedPellets)) {
            return {success: true, data: deletedPellets}
        } else {
            return {success: false}
        }
    }
}
