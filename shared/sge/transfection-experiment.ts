
import { transfectExperiments, transfectTargets } from '../../server/db/schema/sge/transfect-experiment'
import { pellets } from '../../server/db/schema/sge/pellet'

import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { dateSchema } from '../../server/db/helpers/schemas'
import { z } from 'zod'
import _ from 'lodash'
import type { DBQueryConfig } from 'drizzle-orm'
import { eq, inArray } from 'drizzle-orm'

const baseUrl = '/api/transfect-experiments'
const pelletsUrl = '/api/pellets'

const transfectionExperimentSelect = createSelectSchema(transfectExperiments, {startedOn: dateSchema})
const transfectionExperimentUpdate = transfectionExperimentSelect.omit({id: true}).optional()
type TransfectionExperimentSelect = z.infer<typeof transfectionExperimentSelect>
type TransfectionExperimentUpdate = z.infer<typeof transfectionExperimentUpdate>

const pelletInsert = createInsertSchema(pellets).merge(z.object({ replicates: z.string().array() }))
export type PelletInsert = z.infer<typeof pelletInsert>

const pelletSelect = createSelectSchema(pellets).merge(z.object({ replicates: z.string().array() }))
type PelletSelect = z.infer<typeof pelletSelect>

const transfectionTargetSelect = createSelectSchema(transfectTargets)
export type TransfectionTargetSelect = z.infer<typeof transfectionTargetSelect>

type IdOnly = {id: string}

export const VALID_REPLICATES = ['NC', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9']

export class TransfectionExperiment {
    id?: string
    data?: TransfectionExperimentUpdate

    fetchOptions?: {query: {with: DBQueryConfig["with"] }}

    // related data
    transfectTargets?: Object[]
    pellets?: Object[]

    constructor(val?: string | TransfectionExperimentUpdate, withClause?: DBQueryConfig["with"]) {
        if (!_.isObject(val)) {
            this.id = val
        } else {
            this.data = val
        }
        if (withClause) this.fetchOptions = {query: {with: withClause}}
    }

    // assign values and save to database
    async update(values: TransfectionExperimentUpdate) {
        Object.assign(this, values)
        return await this.save()
    }

    // fetch instance from db and populate values
    async fetch() {
        const data = await $fetch(`${baseUrl}/${this.id}`, this.fetchOptions)
        if (!data) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found'
            })
        }
        if (transfectionExperimentSelect.safeParse(data).success) {
            this.data = transfectionExperimentSelect.parse(data)

            if (_.has(data, 'transfectTargets')) {
                this.transfectTargets = _.get(data, 'transfectTargets') as TransfectionTargetSelect[]
                this.pellets = _.compact(_.flatten(_.map(this.transfectTargets, (x:any) => x.pellets as PelletSelect[])))
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
}
