import { dateSchema, nullableDateSchema } from '../../helpers/schemas'
import { projects } from './project'
import { targets } from './target'
import { genes } from './gene'
import { regions } from './region'
import { cycles } from './cycle'
import { transfectExperiments, transfectLotUsage, transfectTargets } from './transfect-experiment'
import { plasmidExperiments } from './plasmid-experiment'
import { extractionExperiments, extractionLotUsage } from './extraction-experiment'
import { pcrExperiments } from './pcr-experiment'
import { plates, viewPlatesWithWellCounts } from './plate'
import { pellets } from './pellet'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { lots } from './lots'
import { reagents } from './reagents'
import { plasmids } from './plasmid'
import { nucleicAcids } from './nucleic-acid'
import { amplificationPrimers, homologyArmPrimers, indexPrimers, linearizationPrimers } from './primer'
import { wellContents, wellContentSources, wells } from './well'
import { sequencingRuns } from './sequencing-run'

// tables
const selectProjectSchema = createSelectSchema(projects, {startedOn: nullableDateSchema})
const insertProjectSchema = selectProjectSchema.omit({id: true})
const updateProjectSchema = insertProjectSchema

const selectTargetSchema = createSelectSchema(targets)
const insertTargetSchema = selectTargetSchema.omit({id: true}).merge(
    z.object({
     skipPositions: z.bigint({ coerce: true }).array().nullable(),
     fixedEdits: z.string().refine((value) => /^g[.][0-9]+[ACGT]>[ACGT]$/.test(value ?? ""), 'HGVS format required').array().nullable()
    }
))
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

const selectCycleSchema = createSelectSchema(cycles, {startedOn: nullableDateSchema, endedOn: nullableDateSchema})
const insertCycleSchema = selectCycleSchema.omit({id: true})
const updateCycleSchema = insertCycleSchema

const selectTransfectExperimentsSchema = createSelectSchema(transfectExperiments, {startedOn: dateSchema})
const insertTransfectExperimentsSchema = selectTransfectExperimentsSchema.omit({id: true})
const updateTransfectExperimentsSchema = insertTransfectExperimentsSchema

const selectTransfectTargetsSchema = createSelectSchema(transfectTargets)
const insertTransfectTargetsSchema = createSelectSchema(transfectTargets).omit({id: true}).partial()
const updateTransfectTargetsSchema = insertTransfectTargetsSchema

const selectTransfectLotUsageSchema = createSelectSchema(transfectLotUsage, {usageOn: nullableDateSchema})
const insertTransfectLotUsageSchema = selectTransfectLotUsageSchema.omit({id: true}).partial()
const updateTransfectLotUsageSchema = insertTransfectLotUsageSchema

const selectPlasmidExperimentsSchema = createSelectSchema(plasmidExperiments, {startedOn: nullableDateSchema})
const insertPlasmidExperimentsSchema = selectPlasmidExperimentsSchema.omit({id: true})
const updatePlasmidExperimentsSchema = insertPlasmidExperimentsSchema

const selectPcrExperimentsSchema = createSelectSchema(pcrExperiments, {startedOn: nullableDateSchema})
const insertPcrExperimentsSchemaOrig = selectPcrExperimentsSchema.omit({id: true})
const insertPcrExperimentsSchema = insertPcrExperimentsSchemaOrig.superRefine((data, ctx) => {
  if (data.pcrType === 'preseq-1' && !data.transfectTargetId) {
    // transfectTargetId is required for preseq-1 PCR experiments, otherwise should be empty
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Target is required for PreSeq-1 PCR experiments",
      path: ["transfectTargetId"], // path to the property where the error occurred
    })
  } else if (data.pcrType !== 'preseq-1' && data.transfectTargetId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Target should not be set for non PreSeq-1 PCR experiments",
      path: ["transfectTargetId"],
    })
  }
})
const updatePcrExperimentsSchema = insertPcrExperimentsSchema

const selectExtractionExperimentsSchema = createSelectSchema(extractionExperiments, {extractedOn: nullableDateSchema})
const insertExtractionExperimentsSchema = selectExtractionExperimentsSchema.omit({id: true})
const updateExtractionExperimentsSchema = insertExtractionExperimentsSchema

const selectExtractionLotUsageSchema = createSelectSchema(extractionLotUsage, {usageOn: nullableDateSchema})
const insertExtractionLotUsageSchema = selectExtractionLotUsageSchema.omit({id: true}).partial()
const updateExtractionLotUsageSchema = insertExtractionLotUsageSchema

const selectPlatesSchema = createSelectSchema(plates)
const insertPlatesSchema = selectPlatesSchema.omit({id: true}).partial()
const updatePlatesSchema = insertPlatesSchema

const selectWellsSchema = createSelectSchema(wells)
const insertWellsSchema = selectWellsSchema.omit({id: true}).partial()
const updateWellsSchema = insertWellsSchema.omit({plateId: true, x: true, y: true})

const selectWellContentsSchema = createSelectSchema(wellContents)
const insertWellContentsSchema = selectWellContentsSchema.omit({id: true}).partial()
const updateWellContentsSchema = insertWellContentsSchema

const selectWellContentSourcesSchema = createSelectSchema(wellContentSources)
const insertWellContentSourcesSchema = selectWellContentSourcesSchema.omit({id: true}).partial()
const updateWellContentSourcesSchema = insertWellContentSourcesSchema

const selectSequencingRunsSchema = createSelectSchema(sequencingRuns, {createdOn: nullableDateSchema, startedOn: nullableDateSchema, endedOn: nullableDateSchema})
const insertSequencingRunsSchema = selectSequencingRunsSchema.omit({id: true}).partial()
const updateSequencingRunsSchema = insertSequencingRunsSchema

const selectPelletsSchema = createSelectSchema(pellets, {harvestedOn: nullableDateSchema})
const insertPelletsSchema = selectPelletsSchema.omit({id: true}).partial()
const updatePelletsSchema = insertPelletsSchema

const selectLotsSchema = createSelectSchema(lots, {preparedOn: nullableDateSchema, storedOn: nullableDateSchema, startedUseOn: nullableDateSchema, endedUseOn: nullableDateSchema, expiresOn: nullableDateSchema})
const insertLotsSchema = selectLotsSchema.omit({id: true})
const updateLotsSchema = insertLotsSchema

const selectReagentsSchema = createSelectSchema(reagents)
const insertReagentsSchema = createSelectSchema(reagents).omit({id: true})
const updateReagentsSchema = insertReagentsSchema

const selectPlasmidsSchema = createSelectSchema(plasmids)
const insertPlasmidsSchema = createSelectSchema(plasmids).omit({id: true})
const updatePlasmidsSchema = insertPlasmidsSchema

const selectNucleicAcidsSchema = createSelectSchema(nucleicAcids)
const insertNucleicAcidsSchema = createSelectSchema(nucleicAcids).omit({id: true}).partial()
const updateNucleicAcidsSchema = insertNucleicAcidsSchema

const selectAmplificationPrimerSchema = createSelectSchema(amplificationPrimers)
const insertAmplificationPrimerSchema = createSelectSchema(amplificationPrimers, {sequence: z.string().regex(new RegExp(/^[ACGT]+$/i))}).omit({id: true})
const updateAmplificationPrimerSchema = insertAmplificationPrimerSchema

const selectHomologyArmPrimerSchema = createSelectSchema(homologyArmPrimers)
const insertHomologyArmPrimerSchema = createSelectSchema(homologyArmPrimers, {sequence: z.string().regex(new RegExp(/^[ACGT]*$/i))}).omit({id: true})
const updateHomologyArmPrimerSchema = insertHomologyArmPrimerSchema

const selectLinearizationPrimerSchema = createSelectSchema(linearizationPrimers)
const insertLinearizationPrimerSchema = createSelectSchema(linearizationPrimers, {sequence: z.string().regex(new RegExp(/^[ACGT]+$/i))}).omit({id: true})
const updateLinearizationPrimerSchema = insertLinearizationPrimerSchema

const selectIndexPrimerSchema = createSelectSchema(indexPrimers)
const insertIndexPrimerSchema = createSelectSchema(indexPrimers, {sequence: z.string().regex(new RegExp(/^[ACGT]+$/i)), indexSequence: z.string().regex(new RegExp(/^[ACGT]+$/i)) }).omit({id: true})
const updateIndexPrimerSchema = insertIndexPrimerSchema

// views
const selectViewPlatesWithWellCountsSchema = createSelectSchema(viewPlatesWithWellCounts)

export const schemas = {
    // tables
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
    transfectLotUsage: {
        select: selectTransfectLotUsageSchema,
        insert: insertTransfectLotUsageSchema,
        update: updateTransfectLotUsageSchema,
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
    wells: {
        select: selectWellsSchema,
        insert: insertWellsSchema,
        update: updateWellsSchema,
    },
    wellContents: {
        select: selectWellContentsSchema,
        insert: insertWellContentsSchema,
        update: updateWellContentsSchema,
    },
    wellContentSources: {
        select: selectWellContentSourcesSchema,
        insert: insertWellContentSourcesSchema,
        update: updateWellContentSourcesSchema,
    },
    sequencingRuns: {
        select: selectSequencingRunsSchema,
        insert: insertSequencingRunsSchema,
        update: updateSequencingRunsSchema,
    },
    extractionExperiments: {
        select: selectExtractionExperimentsSchema,
        insert: insertExtractionExperimentsSchema,
        update: updateExtractionExperimentsSchema,
    },
    extractionLotUsage: {
        select: selectExtractionLotUsageSchema,
        insert: insertExtractionLotUsageSchema,
        update: updateExtractionLotUsageSchema,
    },
    plasmids: {
        select: selectPlasmidsSchema,
        insert: insertPlasmidsSchema,
        update: updatePlasmidsSchema,
    },
    nucleicAcids: {
        select: selectNucleicAcidsSchema,
        insert: insertNucleicAcidsSchema,
        update: updateNucleicAcidsSchema,
    },
    pellets: {
        select: selectPelletsSchema,
        insert: insertPelletsSchema,
        update: updatePelletsSchema,
    },
    lots: {
        select: selectLotsSchema,
        insert: insertLotsSchema,
        update: updateLotsSchema,
    },
    reagents: {
        select: selectReagentsSchema,
        insert: insertReagentsSchema,
        update: updateReagentsSchema,
    },
    amplificationPrimers: {
        select: selectAmplificationPrimerSchema,
        insert: insertAmplificationPrimerSchema,
        update: updateAmplificationPrimerSchema,
    },
    homologyArmPrimers: {
        select: selectHomologyArmPrimerSchema,
        insert: insertHomologyArmPrimerSchema,
        update: updateHomologyArmPrimerSchema,
    },
    linearizationPrimers: {
        select: selectLinearizationPrimerSchema,
        insert: insertLinearizationPrimerSchema,
        update: updateLinearizationPrimerSchema,
    },
    indexPrimers: {
        select: selectIndexPrimerSchema,
        insert: insertIndexPrimerSchema,
        update: updateIndexPrimerSchema,
    },

    // views
    viewPlatesWithWellCounts: {
        select: selectViewPlatesWithWellCountsSchema,
    },
}
