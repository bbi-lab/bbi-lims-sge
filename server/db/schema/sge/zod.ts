import { dateSchema } from '../../helpers/schemas'
import { projects } from './project'
import { targets } from './target'
import { genes } from './gene'
import { createSelectSchema } from 'drizzle-zod'
import { z, ZodObject } from 'zod'
import { type InferSelectModel } from 'drizzle-orm'

const selectProjectSchema = createSelectSchema(projects)
const insertProjectSchema = createSelectSchema(projects, {startedOn: dateSchema}).omit({id: true})
const updateProjectSchema = insertProjectSchema

const selectTargetSchema = createSelectSchema(targets)
const insertTargetSchema = selectTargetSchema.omit({id: true})
const updateTargetSchema = insertTargetSchema

const selectGeneSchema = createSelectSchema(genes)
const updateGeneSchema = selectGeneSchema.omit({id: true})

export const schemas: Record<string, Record<string, ZodObject<any>>> = {
    projects: {
        select: selectProjectSchema,
        insert: insertProjectSchema,
        update: updateProjectSchema,
    },
    targets: {
        select: selectTargetSchema,
        insert: insertTargetSchema,
        update: updateTargetSchema,
    },
    genes: {
        select: selectGeneSchema,
        update: updateGeneSchema,
    }
}
