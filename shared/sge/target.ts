import type { DBQueryConfig } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import _ from "lodash"
import type { z } from "zod"
import { targets } from "~/server/db/schema/sge/target"

const targetSelect = createSelectSchema(targets)
const targetUpdate = targetSelect.omit({id: true}).optional()
type TargetSelect = z.infer<typeof targetSelect>
type TargetUpdate = z.infer<typeof targetUpdate>

const baseUrl = '/api/targets'

export class Target {
    id?: string
    data?: TargetUpdate

    fetchOptions?: {query: {with: DBQueryConfig["with"] }}

    constructor(val?: string | TargetUpdate, withClause?: DBQueryConfig["with"]) {
        if (!_.isObject(val)) {
            this.id = val
        } else {
            this.data = val
        }
        if (withClause) this.fetchOptions = {query: {with: withClause}}
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
        if (targetSelect.safeParse(data).success) {
            this.data = targetSelect.parse(data)
            
            return {success: true}
        }
    }
    // assign values and save to database
    async update(values: TargetUpdate) {
        Object.assign(this, values)
        return await this.save()
    }
    
    // update existing target in db
    async save() {
        if (this.data) {
            const response = await $fetch<TargetSelect>(`${baseUrl}/${this.id}`, {method: 'PUT', body: this.data})
            if (response.id) {
                const {id, ...data} = response
                Object.assign(this, data)
                return {success: true}
            }
        }
    }

    // copy existing target and append auto-incrementing version number
    async getDuplicate() {
        if (this.data) {
            try {
                const existingTargetName = this.data.name || ''
                const targetBaseName = _.split(existingTargetName, '_v')[0]
                let newTargetName
                const lastTarget = await $fetch<TargetSelect[]>(`${baseUrl}`, {
                    query: {
                        where: {
                            startsWith: [{var: 'name'}, `${targetBaseName}_v`]
                        },
                        limit: 1,
                        order: {name: 'desc'}
                    }
                })
                if (lastTarget.length == 1) {
                    if (lastTarget[0].name && /_v[0-9]$/.test(lastTarget[0].name)) {
                        const lastTargetNameParts = _.split(lastTarget[0].name, '_v')
                        if (lastTargetNameParts.length == 2) {
                            newTargetName = `${lastTargetNameParts[0]}_v${parseInt(lastTargetNameParts[1]) + 1}`
                        }
                    } else {
                        return {success: false, message:  'Invalid target name'}
                    }
                } else if (lastTarget.length == 0 && !existingTargetName.includes('_v')) {
                    newTargetName = `${existingTargetName}_v2`
                } 

                if (newTargetName) {
                    return {...this.data, id: undefined, name: newTargetName}
                } else {
                    throw createError({
                        statusCode: 500,
                        statusMessage: 'Error: could not calculate new target version number'
                    })
                }
            } catch (err) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Error'
                })
            }
        }
    }
}
