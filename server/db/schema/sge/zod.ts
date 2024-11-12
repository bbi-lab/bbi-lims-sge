
import { projects } from './project'
import { targets } from './target'
import { genes } from './gene'
import { createSelectSchema } from 'drizzle-zod'
import { z, ZodObject } from 'zod'
import { type InferSelectModel } from 'drizzle-orm'

const selectProjectSchema = createSelectSchema(projects)
const insertProjectSchema = selectProjectSchema.omit({id: true, sizeX: true, sizeY: true})
const updateProjectSchema = selectProjectSchema.omit({id: true})

const selectTargetSchema = createSelectSchema(targets)
const insertTargetSchema = selectTargetSchema.omit({id: true})
const updateTargetSchema = selectTargetSchema.omit({id: true})

const selectGeneSchema = createSelectSchema(genes)
const updateGeneSchema = selectGeneSchema.omit({id: true})

export const schemas: Record<string, Record<string, ZodObject<any>>> = {
    projects: {
        selectProjectSchema,
        insertProjectSchema,
        updateProjectSchema,
    },
    targets: {
        selectTargetSchema,
        insertTargetSchema,
        updateTargetSchema,
    },
    genes: {
        selectGeneSchema,
        updateGeneSchema,
    }
}
