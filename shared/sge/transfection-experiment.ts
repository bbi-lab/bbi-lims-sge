
import { transfectExperiments, transfectTargets } from '../../server/db/schema/sge/transfect-experiment'
import { createSelectSchema } from 'drizzle-zod'
import { dateSchema } from '../../server/db/helpers/schemas'
import { z } from 'zod'
import _ from 'lodash'
import type { DBQueryConfig } from 'drizzle-orm'
import { eq, inArray } from 'drizzle-orm'

const baseUrl = '/api/transfect-experiments'
const transfectionExperimentSelect = createSelectSchema(transfectExperiments, {startedOn: dateSchema})
const transfectionExperimentUpdate = transfectionExperimentSelect.omit({id: true})
type TransfectionExperimentSelect = z.infer<typeof transfectionExperimentSelect>
type TransfectionExperimentUpdate = z.infer<typeof transfectionExperimentUpdate>
type IdOnly = {id: string}

export class TransfectionExperiment {
    // record values
    id?: string
    name?: string
    technician?: Object | string
    startedOn?: Date

    // related data
    transfectTargets?: Object[]

    constructor(id?: string) {
        if (id) this.id = id
    }

    // assign values and save to database
    async update(values: TransfectionExperimentUpdate) {
        Object.assign(this, values)
        await this.save()
    }

    // fetch instance from db and populate values
    async fetch(withClause?: DBQueryConfig["with"]) {
        const fetchOptions = {query: {with: withClause }}
        
        const response = await $fetch(`${baseUrl}/${this.id}`, fetchOptions)
        if (transfectionExperimentSelect.safeParse(response).success) {
            Object.assign(this, response)
        }
    }

    // commit new experiment to db
    async create() {
        const {id, transfectTargets, ...values} = this
        const response = await $fetch<TransfectionExperimentSelect>(baseUrl, {method: 'POST', body: values})
    }

    // update existing experiment in db
    async save() {
        const {id, transfectTargets, ...values} = this
        const response = await $fetch<TransfectionExperimentSelect>(`${baseUrl}/${id}`, {method: 'PUT', body: values})
        if (_.isArray(transfectTargets)) {
            await this.updateTargets()
        }
    }
    
    // delete experiment from db
    async delete() {
        const response = await $fetch<IdOnly>(`${baseUrl}/${this.id}`, {method: 'DELETE'})
        this.id = undefined
    }

    // update related M:M records in db
    async updateTargets() {
        if (this.id && _.isArray(this.transfectTargets)) {
            const experimentId = this.id
            const targetIds = _.map(this.transfectTargets, (x) => _.get(x, 'targetId', ''))

            const existingTargets = await db.select({targetId: transfectTargets.targetId})
                .from(transfectTargets)
                .where(eq(transfectTargets.experimentId, experimentId))
        
            const existingTargetIds =  _.map(existingTargets, (x) => x.targetId)
            const targetsToRemove = _.difference(existingTargetIds, targetIds)
            const targetsToAdd = _.difference(targetIds, existingTargetIds)
        
            if (targetsToAdd?.length > 0)
                await db.insert(transfectTargets).values(_.map(targetsToAdd, (x) => { return {targetId: x, experimentId}}))
            if (targetsToRemove?.length > 0)
                await db.delete(transfectTargets).where(inArray(transfectTargets.targetId, targetsToRemove))
        }
    }
}
