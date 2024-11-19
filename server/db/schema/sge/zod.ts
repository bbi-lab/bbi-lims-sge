import { dateSchema } from '../../helpers/schemas'
import { projects } from './project'
import { targets } from './target'
import { genes } from './gene'
import { regions } from './region'
import { cycles } from './cycle'
import { harvestExperiments } from './harvest-experiment'
import { plasmidExperiments } from './plasmid-experiment'
import { pcrExperiments } from './pcr-experiment'
import { createSelectSchema } from 'drizzle-zod'
import { ZodObject } from 'zod'

const selectProjectSchema = createSelectSchema(projects)
const insertProjectSchema = createSelectSchema(projects, {startedOn: dateSchema}).omit({id: true})
const updateProjectSchema = insertProjectSchema

const selectTargetSchema = createSelectSchema(targets)
const insertTargetSchema = selectTargetSchema.omit({id: true})
const updateTargetSchema = insertTargetSchema

const selectGeneSchema = createSelectSchema(genes)
const updateGeneSchema = selectGeneSchema.omit({id: true})

const selectRegionSchema = createSelectSchema(regions)
const insertRegionSchema = selectRegionSchema.omit({id: true, fixedEdits: true})
const updateRegionSchema = insertRegionSchema

const selectCycleSchema = createSelectSchema(cycles)
const insertCycleSchema = createSelectSchema(cycles, {startedOn: dateSchema, endedOn: dateSchema}).omit({id: true})
const updateCycleSchema = insertCycleSchema

const selectHarvestExperimentsSchema = createSelectSchema(harvestExperiments)
const insertHarvestExperimentsSchema = createSelectSchema(harvestExperiments, {startedOn: dateSchema}).omit({id: true})
const updateHarvestExperimentsSchema = insertHarvestExperimentsSchema

const selectPlasmidExperimentsSchema = createSelectSchema(plasmidExperiments)
const insertPlasmidExperimentsSchema = createSelectSchema(plasmidExperiments, {startedOn: dateSchema}).omit({id: true})
const updatePlasmidExperimentsSchema = insertPlasmidExperimentsSchema

const selectPcrExperimentsSchema = createSelectSchema(pcrExperiments)
const insertPcrExperimentsSchema = createSelectSchema(pcrExperiments, {startedOn: dateSchema}).omit({id: true})
const updatePcrExperimentsSchema = insertPcrExperimentsSchema

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
    },
    regions: {
        select: selectRegionSchema,
        insert: insertRegionSchema,
        update: updateRegionSchema,
    },
    cycles: {
        select: selectCycleSchema,
        insert: insertCycleSchema,
        update: updateCycleSchema,
    },
    harvestExperiments: {
        select: selectHarvestExperimentsSchema,
        insert: insertHarvestExperimentsSchema,
        update: updateHarvestExperimentsSchema,
    },
    plasmidExperiments: {
        select: selectPlasmidExperimentsSchema,
        insert: insertPlasmidExperimentsSchema,
        update: updatePlasmidExperimentsSchema,
    },
    pcrExperiments: {
        select: selectPcrExperimentsSchema,
        insert: insertPcrExperimentsSchema,
        update: updatePcrExperimentsSchema,
    }
}
