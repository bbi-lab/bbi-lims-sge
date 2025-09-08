import { dateSchema, nullableDateSchema } from '../../helpers/schemas'
import { projects } from './project'
import { targets } from './target'
import { genes } from './gene'
import { regions } from './region'
import { cycles } from './cycle'
import { transfectExperiments, transfectLotUsage, transfectTargets } from './transfect-experiment'
import { haCloningExperiments, sgRnaCloningExperiments, snvLibCloningExperiments } from './plasmid-experiment'
import { extractionExperiments, extractionLotUsage } from './extraction-experiment'
import { pcrExperiments } from './pcr-experiment'
import { plates, viewPlatesWithWellCounts } from './plate'
import { pellets } from './pellet'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { lots } from './lots'
import { reagents } from './reagents'
import { sgRnaPlasmids, snvLibPlasmids } from './plasmid'
import { nucleicAcids } from './nucleic-acid'
import { amplificationPrimers, homologyArmPrimers, homologyArmPuc19Primers, indexPrimers, linearizationPrimers, preseq1Primers, preseq2Primers } from './primer'
import { wellContents, wellContentSources, wells } from './well'
import { sequencingRuns, sequencingRunSamples, sequencingRunExternalSamples, viewSequencingRunAllSamples } from './sequencing-run'
import { haPcrProducts, haPuc19GibsonProducts, haPuc19PcrProducts, sgRnaOligos, viewHaPuc19GibsonProductsWithCalcs } from './oligos'
import { externalSamples } from './external-samples'

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

const selectSgRnaCloningExperimentsSchema = createSelectSchema(sgRnaCloningExperiments, {transformedOn: nullableDateSchema})
const insertSgRnaCloningExperimentsSchema = selectSgRnaCloningExperimentsSchema.omit({id: true})
const updateSgRnaCloningExperimentsSchema = insertSgRnaCloningExperimentsSchema

const selectHaCloningExperimentsSchema = createSelectSchema(haCloningExperiments, {startedOn: nullableDateSchema})
const insertHaCloningExperimentsSchema = selectHaCloningExperimentsSchema.omit({id: true})
const updateHaCloningExperimentsSchema = insertHaCloningExperimentsSchema

const selectHaPcrProductsSchema = createSelectSchema(haPcrProducts, {performedOn: nullableDateSchema})
const insertHaPcrProductsSchema = selectHaPcrProductsSchema.omit({id: true})
const updateHaPcrProductsSchema = insertHaPcrProductsSchema

const selectHaPuc19PcrProductsSchema = createSelectSchema(haPuc19PcrProducts, {cleanedOn: nullableDateSchema})
const insertHaPuc19PcrProductsSchema = selectHaPuc19PcrProductsSchema.omit({id: true})
const updateHaPuc19PcrProductsSchema = insertHaPuc19PcrProductsSchema

const selectHaPuc19GibsonProductsSchema = createSelectSchema(haPuc19GibsonProducts, {preppedOn: nullableDateSchema})
const insertHaPuc19GibsonProductsSchema = selectHaPuc19GibsonProductsSchema.omit({id: true})
const updateHaPuc19GibsonProductsSchema = insertHaPuc19GibsonProductsSchema

const selectSnvLibCloningExperimentsSchema = createSelectSchema(snvLibCloningExperiments, {transformedOn: nullableDateSchema})
const insertSnvLibCloningExperimentsSchema = selectSnvLibCloningExperimentsSchema.omit({id: true})
const updateSnvLibCloningExperimentsSchema = insertSnvLibCloningExperimentsSchema

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

const selectSequencingRunSamples = createSelectSchema(sequencingRunSamples)
const insertSequencingRunSamples = selectSequencingRunSamples.omit({id: true, createdAt: true}).partial()
const updateSequencingRunSamples = insertSequencingRunSamples

const selectExternalSamples = createSelectSchema(externalSamples)
const insertExternalSamples = createSelectSchema(externalSamples, {
    customIndexSeq1: z.string().regex(new RegExp(/^[ACGT]*$/i)).nullable(),
    customIndexSeq2: z.string().regex(new RegExp(/^[ACGT]*$/i)).nullable(),
}).omit({id: true, createdAt: true}).partial()
const updateExternalSamples = insertExternalSamples

const selectSequencingRunExternalSamples = createSelectSchema(sequencingRunExternalSamples)
const insertSequencingRunExternalSamples = createSelectSchema(sequencingRunExternalSamples, {
    customIndexSeq1: z.string().regex(new RegExp(/^[ACGT]*$/i)).nullable(),
    customIndexSeq2: z.string().regex(new RegExp(/^[ACGT]*$/i)).nullable(),
}).omit({id: true}).partial()
const updateSequencingRunExternalSamples = insertSequencingRunExternalSamples

const selectPelletsSchema = createSelectSchema(pellets, {harvestedOn: nullableDateSchema})
const insertPelletsSchema = selectPelletsSchema.omit({id: true}).partial()
const updatePelletsSchema = insertPelletsSchema

const selectLotsSchema = createSelectSchema(lots, {preparedOn: nullableDateSchema, storedOn: nullableDateSchema, startedUseOn: nullableDateSchema, endedUseOn: nullableDateSchema, expiresOn: nullableDateSchema})
const insertLotsSchema = selectLotsSchema.omit({id: true})
const updateLotsSchema = insertLotsSchema

const selectReagentsSchema = createSelectSchema(reagents)
const insertReagentsSchema = createSelectSchema(reagents).omit({id: true})
const updateReagentsSchema = insertReagentsSchema

const selectSgRnaPlasmidsSchema = createSelectSchema(sgRnaPlasmids)
const insertSgRnaPlasmidsSchema = createSelectSchema(sgRnaPlasmids).omit({id: true})
const updateSgRnaPlasmidsSchema = insertSgRnaPlasmidsSchema

const selectSnvLibPlasmidsSchema = createSelectSchema(snvLibPlasmids)
const insertSnvLibPlasmidsSchema = createSelectSchema(snvLibPlasmids).omit({id: true})
const updateSnvLibPlasmidsSchema = insertSnvLibPlasmidsSchema

const selectSgRnaOligosSchema = createSelectSchema(sgRnaOligos)
const insertSgRnaOligosSchema = createSelectSchema(sgRnaOligos).omit({id: true})
const updateSgRnaOligosSchema = insertSgRnaOligosSchema

const selectNucleicAcidsSchema = createSelectSchema(nucleicAcids)
const insertNucleicAcidsSchema = createSelectSchema(nucleicAcids).omit({id: true}).partial()
const updateNucleicAcidsSchema = insertNucleicAcidsSchema

const selectAmplificationPrimerSchema = createSelectSchema(amplificationPrimers)
const insertAmplificationPrimerSchema = createSelectSchema(amplificationPrimers, {sequence: z.string().regex(new RegExp(/^[ACGT]+$/i))}).omit({id: true})
const updateAmplificationPrimerSchema = insertAmplificationPrimerSchema

const selectHomologyArmPrimerSchema = createSelectSchema(homologyArmPrimers)
const insertHomologyArmPrimerSchema = createSelectSchema(homologyArmPrimers, {sequence: z.string().regex(new RegExp(/^[ACGT]*$/i))}).omit({id: true})
const updateHomologyArmPrimerSchema = insertHomologyArmPrimerSchema

const selectHomologyArmPuc19PrimerSchema = createSelectSchema(homologyArmPuc19Primers)
const insertHomologyArmPuc19PrimerSchema = createSelectSchema(homologyArmPuc19Primers, {sequence: z.string().regex(new RegExp(/^[ACGT]*$/i))}).omit({id: true}).partial()
const updateHomologyArmPuc19PrimerSchema = insertHomologyArmPuc19PrimerSchema

const selectLinearizationPrimerSchema = createSelectSchema(linearizationPrimers)
const insertLinearizationPrimerSchema = createSelectSchema(linearizationPrimers, {sequence: z.string().regex(new RegExp(/^[ACGT]+$/i))}).omit({id: true})
const updateLinearizationPrimerSchema = insertLinearizationPrimerSchema

const selectIndexPrimerSchema = createSelectSchema(indexPrimers)
const insertIndexPrimerSchema = createSelectSchema(indexPrimers, {sequence: z.string().regex(new RegExp(/^[ACGT]+$/i)), indexSequence: z.string().regex(new RegExp(/^[ACGT]+$/i)) }).omit({id: true})
const updateIndexPrimerSchema = insertIndexPrimerSchema

const selectpreseq1PrimerSchema = createSelectSchema(preseq1Primers)
const insertpreseq1PrimerSchema = createSelectSchema(preseq1Primers, {sequence: z.string().regex(new RegExp(/^[ACGT]+$/i))}).omit({id: true})
const updatepreseq1PrimerSchema = insertpreseq1PrimerSchema

const selectpreseq2PrimerSchema = createSelectSchema(preseq2Primers)
const insertpreseq2PrimerSchema = createSelectSchema(preseq2Primers, {sequence: z.string().regex(new RegExp(/^[ACGT]+$/i)), adapterSequence: z.string().regex(new RegExp(/^[ACGT]+$/i))}).omit({id: true})
const updatepreseq2PrimerSchema = insertpreseq2PrimerSchema

// views
const selectViewPlatesWithWellCountsSchema = createSelectSchema(viewPlatesWithWellCounts)
const selectViewSequencingRunAllSamplesSchema = createSelectSchema(viewSequencingRunAllSamples)
const selectViewHaPuc19GibsonProductsWithCalcsSchema = createSelectSchema(viewHaPuc19GibsonProductsWithCalcs)

// export all schemas
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
    sgRnaCloningExperiments: {
        select: selectSgRnaCloningExperimentsSchema,
        insert: insertSgRnaCloningExperimentsSchema,
        update: updateSgRnaCloningExperimentsSchema,
    },
    haCloningExperiments: {
        select: selectHaCloningExperimentsSchema,
        insert: insertHaCloningExperimentsSchema,
        update: updateHaCloningExperimentsSchema,
    },
    haPcrProducts: {
        select: selectHaPcrProductsSchema,
        insert: insertHaPcrProductsSchema,
        update: updateHaPcrProductsSchema,
    },
    haPuc19PcrProducts: {
        select: selectHaPuc19PcrProductsSchema,
        insert: insertHaPuc19PcrProductsSchema,
        update: updateHaPuc19PcrProductsSchema,
    },
    haPuc19GibsonProducts: {
        select: selectHaPuc19GibsonProductsSchema,
        insert: insertHaPuc19GibsonProductsSchema,
        update: updateHaPuc19GibsonProductsSchema,
    },
    snvLibCloningExperiments: {
        select: selectSnvLibCloningExperimentsSchema,
        insert: insertSnvLibCloningExperimentsSchema,
        update: updateSnvLibCloningExperimentsSchema,
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
    sequencingRunSamples: {
        select: selectSequencingRunSamples,
        insert: insertSequencingRunSamples,
        update: updateSequencingRunSamples,
    },
    externalSamples: {
        select: selectExternalSamples,
        insert: insertExternalSamples,
        update: updateExternalSamples,
    },
    sequencingRunExternalSamples: {
        select: selectSequencingRunExternalSamples,
        insert: insertSequencingRunExternalSamples,
        update: updateSequencingRunExternalSamples,
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
    sgRnaPlasmids: {
        select: selectSgRnaPlasmidsSchema,
        insert: insertSgRnaPlasmidsSchema,
        update: updateSgRnaPlasmidsSchema,
    },
    snvLibPlasmids: {
        select: selectSnvLibPlasmidsSchema,
        insert: insertSnvLibPlasmidsSchema,
        update: updateSnvLibPlasmidsSchema,
    },
    nucleicAcids: {
        select: selectNucleicAcidsSchema,
        insert: insertNucleicAcidsSchema,
        update: updateNucleicAcidsSchema,
    },
    sgRnaOligos: {
        select: selectSgRnaOligosSchema,
        insert: insertSgRnaOligosSchema,
        update: updateSgRnaOligosSchema,
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
    homologyArmPuc19Primers: {
        select: selectHomologyArmPuc19PrimerSchema,
        insert: insertHomologyArmPuc19PrimerSchema,
        update: updateHomologyArmPuc19PrimerSchema,
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
    preseq1Primers: {
        select: selectpreseq1PrimerSchema,
        insert: insertpreseq1PrimerSchema,
        update: updatepreseq1PrimerSchema,
    },
    preseq2Primers: {
        select: selectpreseq2PrimerSchema,
        insert: insertpreseq2PrimerSchema,
        update: updatepreseq2PrimerSchema,
    },
    // views
    viewPlatesWithWellCounts: {
        select: selectViewPlatesWithWellCountsSchema,
    },
    viewSequencingRunAllSamples: {
        select: selectViewSequencingRunAllSamplesSchema
    },
    viewHaPuc19GibsonProductsWithCalcs: {
        select: selectViewHaPuc19GibsonProductsWithCalcsSchema
    },
}
