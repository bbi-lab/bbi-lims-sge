import { dateSchema } from '../../helpers/schemas'
import { projects } from './project'
import { targets } from './target'
import { genes } from './gene'
import { regions } from './region'
import { cycles } from './cycle'
import { transfectExperiments } from './transfect-experiment'
import { plasmidExperiments } from './plasmid-experiment'
import { extractionExperiments } from './extraction-experiment'
import { pcrExperiments } from './pcr-experiment'
import { plates } from './plate'
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
const insertRegionSchema = selectRegionSchema.omit({id: true})
const updateRegionSchema = insertRegionSchema

const selectCycleSchema = createSelectSchema(cycles)
const insertCycleSchema = createSelectSchema(cycles, {startedOn: dateSchema, endedOn: dateSchema}).omit({id: true})
const updateCycleSchema = insertCycleSchema

const selecttransfectExperimentsSchema = createSelectSchema(transfectExperiments)
const inserttransfectExperimentsSchema = createSelectSchema(transfectExperiments, {startedOn: dateSchema}).omit({id: true})
const updatetransfectExperimentsSchema = inserttransfectExperimentsSchema

const selectPlasmidExperimentsSchema = createSelectSchema(plasmidExperiments)
const insertPlasmidExperimentsSchema = createSelectSchema(plasmidExperiments, {startedOn: dateSchema}).omit({id: true})
const updatePlasmidExperimentsSchema = insertPlasmidExperimentsSchema

const selectPcrExperimentsSchema = createSelectSchema(pcrExperiments)
const insertPcrExperimentsSchema = createSelectSchema(pcrExperiments, {startedOn: dateSchema}).omit({id: true})
const updatePcrExperimentsSchema = insertPcrExperimentsSchema

const selectExtractionExperimentsSchema = createSelectSchema(extractionExperiments)
const insertExtractionExperimentsSchema = createSelectSchema(extractionExperiments, {extractedOn: dateSchema}).omit({id: true})
const updateExtractionExperimentsSchema = insertExtractionExperimentsSchema

const selectPlatesSchema = createSelectSchema(plates)
const insertPlatesSchema = selectPlatesSchema.omit({id: true})
const updatePlatesSchema = insertPlatesSchema

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
    transfectExperiments: {
        select: selecttransfectExperimentsSchema,
        insert: inserttransfectExperimentsSchema,
        update: updatetransfectExperimentsSchema,
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
    },
    plates: {
        select: selectPlatesSchema,
        insert: insertPlatesSchema,
        update: updatePlatesSchema,
    },
    extractionExperiments: {
        select: selectExtractionExperimentsSchema,
        insert: insertExtractionExperimentsSchema,
        update: updateExtractionExperimentsSchema,
    },
}
