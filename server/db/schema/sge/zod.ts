import { dateSchema } from '../../helpers/schemas'
import { projects } from './project'
import { targets } from './target'
import { genes } from './gene'
import { regions } from './region'
import { cycles } from './cycle'
import { transfectExperiments, transfectTargets } from './transfect-experiment'
import { plasmidExperiments } from './plasmid-experiment'
import { extractionExperiments } from './extraction-experiment'
import { pcrExperiments } from './pcr-experiment'
import { plates } from './plate'
import { pellets } from './pellet'
import { storageBoxes } from './storage-box'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

const selectProjectSchema = createSelectSchema(projects)
const insertProjectSchema = createSelectSchema(projects, {startedOn: dateSchema}).omit({id: true})
const updateProjectSchema = insertProjectSchema

const selectTargetSchema = createSelectSchema(targets)
const insertTargetSchema = selectTargetSchema.omit({id: true})
const updateTargetSchema = insertTargetSchema

const selectGeneSchema = createSelectSchema(genes)
const updateGeneSchema = createSelectSchema(genes, {
    startPosition: z.bigint({ coerce: true }),
    endPosition: z.bigint({ coerce: true }),
    ncbiGeneId: z.bigint({ coerce: true }),
    proteinLength: z.bigint({ coerce: true }),
}).omit({id: true}).partial()

const selectRegionSchema = createSelectSchema(regions)
const insertRegionSchema = createSelectSchema(regions, {
    ampliconStart: z.bigint({ coerce: true }),
    ampliconEnd: z.bigint({ coerce: true }),
    snvLibraryStart: z.bigint({ coerce: true }),
    snvLibraryEnd: z.bigint({ coerce: true })
}).omit({id: true}).partial()
const updateRegionSchema = insertRegionSchema

const selectCycleSchema = createSelectSchema(cycles)
const insertCycleSchema = createSelectSchema(cycles, {startedOn: dateSchema, endedOn: dateSchema}).omit({id: true})
const updateCycleSchema = insertCycleSchema

const selectTransfectExperimentsSchema = createSelectSchema(transfectExperiments)
const insertTransfectExperimentsSchema = createSelectSchema(transfectExperiments, {startedOn: dateSchema}).omit({id: true})
const updateTransfectExperimentsSchema = insertTransfectExperimentsSchema

const selectTransfectTargetsSchema = createSelectSchema(transfectTargets)
const insertTransfectTargetsSchema = createSelectSchema(transfectTargets, {
    transfectionCount: z.bigint({ coerce: true })
}).omit({id: true}).partial()
const updateTransfectTargetsSchema = insertTransfectTargetsSchema

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

const selectPelletsSchema = createSelectSchema(pellets)
const insertPelletsSchema = createSelectSchema(pellets, {harvestedOn: dateSchema}).omit({id: true}).partial()
const updatePelletsSchema = insertPelletsSchema

const selectStorageBoxesSchema = createSelectSchema(storageBoxes)
const insertStorageBoxesSchema = createSelectSchema(storageBoxes).omit({id: true})
const updateStorageBoxesSchema = insertStorageBoxesSchema

export const schemas = {
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
        select: selectTransfectExperimentsSchema,
        insert: insertTransfectExperimentsSchema,
        update: updateTransfectExperimentsSchema,
    },
    transfectTargets: {
        select: selectTransfectTargetsSchema,
        insert: insertTransfectTargetsSchema,
        update: updateTransfectTargetsSchema,
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
    pellets: {
        select: selectPelletsSchema,
        insert: insertPelletsSchema,
        update: updatePelletsSchema,
    },
    storageBoxes: {
        select: selectStorageBoxesSchema,
        insert: insertStorageBoxesSchema,
        update: updateStorageBoxesSchema,
    },
}
