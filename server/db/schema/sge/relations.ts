import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { pcrExperiments, pcrExperimentTargets } from './pcr-experiment'
import { transfectExperiments, transfectTargets, transfectLotUsage } from './transfect-experiment'
import { extractionExperiments, extractionLotUsage } from './extraction-experiment'
import { plates } from './plate'
import { wellables, wellContents, wellContentSources, wells } from './well'
import { users } from '../user'
import { projects } from './project'
import { targets } from './target'
import { genes } from './gene'
import { regions } from './region'
import { cycles } from './cycle'
import { pellets } from './pellet'
import { relationsConfigToRelations } from '../relations'
import { lots } from './lots'
import { reagents } from './reagents'
import { nucleicAcids, dna, rna } from './nucleic-acid'
import { amplificationPrimers, homologyArmPrimers, homologyArmPrimerTargets, homologyArmPuc19Primers, indexPrimers, linearizationPrimers, preseq1Primers, preseq1PrimerTargets, preseq2Primers, rnaPreseq1Primers, rnaPreseq1PrimerTargets, rnaPreseq2Primers, rnaPreseq2PrimerTargets, rnaRtPrimers } from './primer'
import { sequencingRuns, sequencingRunSamples, sequencingRunExternalSamples } from './sequencing-run'
import { clonalHas, clonalHaTargets, haPcrProducts, haPuc19GibsonProducts, haPuc19PcrProducts, sgRnaOligos, sgRnaOligoTargets, snvLibAmpProducts, snvLibClonalDnaProducts, snvLibGibsonProducts, snvLibGoldenGateProducts, snvLibLinProducts } from './oligos'
import { haPuc19Plasmids, sgRnaPlasmids, sgRnaPlasmidTargets, snvLibPlasmids } from './plasmid'
import { sgRnaCloningExperiments, snvLibCloningExperiments, haCloningExperiments, haCloningExperimentTargets } from './plasmid-experiment'
import { externalSamples } from './external-samples'

const genesRelationsConfig: RelationsConfig = {
    many: {
        regions: {
            table: regions,
            schema: createSelectSchema(regions),
            fields: [regions.geneId]
        },
        rnaRtPrimers: {
            table: rnaRtPrimers,
            schema: createSelectSchema(rnaRtPrimers),
            fields: [rnaRtPrimers.geneId],
        },
    }
}
export const genesRelations = relationsConfigToRelations(genes, genesRelationsConfig)

const pcrExperimentsRelationsConfig: RelationsConfig = {
    one:{
        technician: {
            fields: [pcrExperiments.technician],
            referenceTable: users,
            references: [users.id],
        },
        plate: {
            fields: [pcrExperiments.plateId],
            referenceTable: plates,
            references: [plates.id],
        },
    },
    many: {
        pcrExperimentTargets: {
            table: pcrExperimentTargets,
            schema: createSelectSchema(pcrExperimentTargets),
            fields: [pcrExperimentTargets.pcrExperimentId],
        },
    }
}
export const pcrExperimentsRelations = relationsConfigToRelations(pcrExperiments, pcrExperimentsRelationsConfig)

const pcrExperimentTargetsRelationsConfig: RelationsConfig = {
    one:{
        pcrExperiment: {
            fields: [pcrExperimentTargets.pcrExperimentId],
            referenceTable: pcrExperiments,
            references: [pcrExperiments.id],
        },
        transfectTarget: {
            fields: [pcrExperimentTargets.transfectTargetId],
            referenceTable: transfectTargets,
            references: [transfectTargets.id],
        },
    }
}
export const pcrExperimentTargetsRelations = relationsConfigToRelations(pcrExperimentTargets, pcrExperimentTargetsRelationsConfig)

const wellContentsRelationsConfig: RelationsConfig = {
    one:{
        well: {
            fields: [wellContents.wellId],
            referenceTable: wells,
            references: [wells.id],
        },
        // amplificationPrimer: {
        //     fields: [wellContents.amplificationPrimerId],
        //     referenceTable: amplificationPrimers,
        //     references: [amplificationPrimers.id],
        // },
        // linearizationPrimer: {
        //     fields: [wellContents.linearizationPrimerId],
        //     referenceTable: linearizationPrimers,
        //     references: [linearizationPrimers.id],
        // },
        // homologyArmPrimer: {
        //     fields: [wellContents.homologyArmPrimerId],
        //     referenceTable: homologyArmPrimers,
        //     references: [homologyArmPrimers.id],
        // },
        // preseq1Primer: {
        //     fields: [wellContents.preseq1PrimerId],
        //     referenceTable: preseq1Primers,
        //     references: [preseq1Primers.id],
        // },
        // preseq2Primer: {
        //     fields: [wellContents.preseq2PrimerId],
        //     referenceTable: preseq2Primers,
        //     references: [preseq2Primers.id],
        // },
        // indexPrimer: {
        //     fields: [wellContents.indexPrimerId],
        //     referenceTable: indexPrimers,
        //     references: [indexPrimers.id],
        // },
        // nucleicAcid: {
        //     fields: [wellContents.nucleicAcidId],
        //     referenceTable: nucleicAcids,
        //     references: [nucleicAcids.id],
        // },
        // pellet: {
        //     fields: [wellContents.pelletId],
        //     referenceTable: pellets,
        //     references: [pellets.id],
        // },
        // sgRnaPlasmid: {
        //     fields: [wellContents.sgRnaPlasmidId],
        //     referenceTable: sgRnaPlasmids,
        //     references: [sgRnaPlasmids.id],
        // },
        // snvLibPlasmid: {
        //     fields: [wellContents.snvLibPlasmidId],
        //     referenceTable: snvLibPlasmids,
        //     references: [snvLibPlasmids.id],
        // },
        // sgRnaOligo: {
        //     fields: [wellContents.sgRnaOligoId],
        //     referenceTable: sgRnaOligos,
        //     references: [sgRnaOligos.id],
        // },
        // externalSample: {
        //     fields: [wellContents.externalSampleId],
        //     referenceTable: externalSamples,
        //     references: [externalSamples.id],
        // },
        wellable: {
            fields: [wellContents.wellableId],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    many: {
        wellContentSources: {
            table: wellContentSources,
            schema: createSelectSchema(wellContentSources),
            fields: [wellContentSources.wellContentId],
        },
    },
}
export const wellContentsRelations = relationsConfigToRelations(wellContents, wellContentsRelationsConfig)

const wellablesRelationsConfig: RelationsConfig = {
    one: {
        amplificationPrimer: {
            fields: [wellables.id],
            referenceTable: amplificationPrimers,
            references: [amplificationPrimers.id],
        },
        linearizationPrimer: {
            fields: [wellables.id],
            referenceTable: linearizationPrimers,
            references: [linearizationPrimers.id],
        },
        homologyArmPrimer: {
            fields: [wellables.id],
            referenceTable: homologyArmPrimers,
            references: [homologyArmPrimers.id],
        },
        homologyArmPuc19Primer: {
            fields: [wellables.id],
            referenceTable: homologyArmPuc19Primers,
            references: [homologyArmPuc19Primers.id],
        },
        preseq1Primer: {
            fields: [wellables.id],
            referenceTable: preseq1Primers,
            references: [preseq1Primers.id],
        },
        preseq2Primer: {
            fields: [wellables.id],
            referenceTable: preseq2Primers,
            references: [preseq2Primers.id],
        },
        rnaPreseq1Primer: {
            fields: [wellables.id],
            referenceTable: rnaPreseq1Primers,
            references: [rnaPreseq1Primers.id],
        },
        rnaPreseq2Primer: {
            fields: [wellables.id],
            referenceTable: rnaPreseq2Primers,
            references: [rnaPreseq2Primers.id],
        },
        rnaRtPrimer: {
            fields: [wellables.id],
            referenceTable: rnaRtPrimers,
            references: [rnaRtPrimers.id],
        },
        indexPrimer: {
            fields: [wellables.id],
            referenceTable: indexPrimers,
            references: [indexPrimers.id],
        },
        nucleicAcid: {
            fields: [wellables.id],
            referenceTable: nucleicAcids,
            references: [nucleicAcids.id],
        },
        dna: {
            fields: [wellables.id],
            referenceTable: dna,
            references: [dna.id],
        },
        rna: {
            fields: [wellables.id],
            referenceTable: rna,
            references: [rna.id],
        },
        pellet: {
            fields: [wellables.id],
            referenceTable: pellets,
            references: [pellets.id],
        },
        sgRnaPlasmid: {
            fields: [wellables.id],
            referenceTable: sgRnaPlasmids,
            references: [sgRnaPlasmids.id],
        },
        snvLibPlasmid: {
            fields: [wellables.id],
            referenceTable: snvLibPlasmids,
            references: [snvLibPlasmids.id],
        },
        sgRnaOligo: {
            fields: [wellables.id],
            referenceTable: sgRnaOligos,
            references: [sgRnaOligos.id],
        },
        externalSample: {
            fields: [wellables.id],
            referenceTable: externalSamples,
            references: [externalSamples.id],
        },
        haPcrProduct: {
            fields: [wellables.id],
            referenceTable: haPcrProducts,
            references: [haPcrProducts.id],
        },
        haPuc19PcrProduct: {
            fields: [wellables.id],
            referenceTable: haPuc19PcrProducts,
            references: [haPuc19PcrProducts.id],
        },
        haPuc19GibsonProduct: {
            fields: [wellables.id],
            referenceTable: haPuc19GibsonProducts,
            references: [haPuc19GibsonProducts.id],
        },
        haPuc19Plasmid: {
            fields: [wellables.id],
            referenceTable: haPuc19Plasmids,
            references: [haPuc19Plasmids.id],
        },
        snvLibAmpProduct: {
            fields: [wellables.id],
            referenceTable: snvLibAmpProducts,
            references: [snvLibAmpProducts.id],
        },
        snvLibLinProduct: {
            fields: [wellables.id],
            referenceTable: snvLibLinProducts,
            references: [snvLibLinProducts.id],
        },
        snvLibGibsonProduct: {
            fields: [wellables.id],
            referenceTable: snvLibGibsonProducts,
            references: [snvLibGibsonProducts.id],
        },
    },
    many: {
        wellContents: {
            table: wellContents,
            schema: createSelectSchema(wellContents),
            fields: [wellContents.wellableId],
        },
    }
}
export const wellablesRelations = relationsConfigToRelations(wellables, wellablesRelationsConfig)

const wellContentSourcesRelationsConfig: RelationsConfig = {
    one: {
        wellContent: {
            fields: [wellContentSources.wellContentId],
            referenceTable: wellContents,
            references: [wellContents.id],
        },
        sourceWell: {
            fields: [wellContentSources.sourceWellId],
            referenceTable: wells,
            references: [wells.id],
        },
        createdBy: {
            fields: [wellContentSources.createdBy],
            referenceTable: users,
            references: [users.id],
        },
    },
}
export const wellContentSourcesRelations = relationsConfigToRelations(wellContentSources, wellContentSourcesRelationsConfig)

const wellsRelationsConfig: RelationsConfig = {
    one:{
        plate: {
            fields: [wells.plateId],
            referenceTable: plates,
            references: [plates.id],
        },
    },
    many: {
        wellContents: {
            fields: [wellContents.wellId],
            table: wellContents,
            schema: createSelectSchema(wellContents),
        }
    }
}
export const wellsRelations = relationsConfigToRelations(wells, wellsRelationsConfig)

const platesRelationsConfig: RelationsConfig = {
    many: {
        wells: {
            table: wells,
            schema: createSelectSchema(wells),
            fields: [wells.plateId],
        },
        pcrExperiments: {
            table: pcrExperiments,
            schema: createSelectSchema(pcrExperiments),
            fields: [pcrExperiments.plateId],
        },
        sgRnaCloningExperiments: {
            table: sgRnaCloningExperiments,
            schema: createSelectSchema(sgRnaCloningExperiments),
            fields: [sgRnaCloningExperiments.plateId],
        },
    }
}
export const platesRelations = relationsConfigToRelations(plates, platesRelationsConfig)

const sequencingRunsRelationsConfig: RelationsConfig = {
    many: {
        samples: {
            table: sequencingRunSamples,
            schema: createSelectSchema(sequencingRunSamples),
            fields: [sequencingRunSamples.sequencingRunId],
        },
        externalSamples: {
            table: sequencingRunExternalSamples,
            schema: createSelectSchema(sequencingRunExternalSamples),
            fields: [sequencingRunExternalSamples.sequencingRunId],
        },
    }
}
export const sequencingRunsRelations = relationsConfigToRelations(sequencingRuns, sequencingRunsRelationsConfig)

const sequencingRunSamplesRelationsConfig: RelationsConfig = {
    one: {
        sequencingRun: {
            fields: [sequencingRunSamples.sequencingRunId],
            referenceTable: sequencingRuns,
            references: [sequencingRuns.id],
        },
        dna: {
            fields: [sequencingRunSamples.dnaId],
            referenceTable: dna,
            references: [dna.id],
        },
        rna: {
            fields: [sequencingRunSamples.rnaId],
            referenceTable: rna,
            references: [rna.id],
        },
        indexPrimer1: {
            fields: [sequencingRunSamples.indexPrimer1Id],
            referenceTable: indexPrimers,
            references: [indexPrimers.id],
        },
        indexPrimer2: {
            fields: [sequencingRunSamples.indexPrimer2Id],
            referenceTable: indexPrimers,
            references: [indexPrimers.id],
        },
        sourceWell: {
            fields: [sequencingRunSamples.sourceWellId],
            referenceTable: wells,
            references: [wells.id],
        },
    },
}
export const sequencingRunSamplesRelations = relationsConfigToRelations(sequencingRunSamples, sequencingRunSamplesRelationsConfig)

const externalSamplesRelationsConfig: RelationsConfig = {
    one: {
        wellable: {
            fields: [externalSamples.id],
            referenceTable: wellables,
            references: [wellables.id],
        }
    },
    many: {
        sequencingRuns: {
            table: sequencingRunExternalSamples,
            schema: createSelectSchema(sequencingRunExternalSamples),
            fields: [sequencingRunExternalSamples.externalSampleId],
        },
        // wellContents: {
        //     table: wellContents,
        //     schema: createSelectSchema(wellContents),
        //     fields: [wellContents.externalSampleId],
        // },
    }
}
export const externalSamplesRelations = relationsConfigToRelations(externalSamples, externalSamplesRelationsConfig)

const sequencingRunExternalSamplesRelationsConfig: RelationsConfig = {
    one: {
        externalSample: {
            fields: [sequencingRunExternalSamples.externalSampleId],
            referenceTable: externalSamples,
            references: [externalSamples.id],
        },
        sequencingRun: {
            fields: [sequencingRunExternalSamples.sequencingRunId],
            referenceTable: sequencingRuns,
            references: [sequencingRuns.id],
        },
        indexPrimer1: {
            fields: [sequencingRunExternalSamples.indexPrimer1Id],
            referenceTable: indexPrimers,
            references: [indexPrimers.id],
        },
        indexPrimer2: {
            fields: [sequencingRunExternalSamples.indexPrimer2Id],
            referenceTable: indexPrimers,
            references: [indexPrimers.id],
        },
        sourceWell: {
            fields: [sequencingRunExternalSamples.sourceWellId],
            referenceTable: wells,
            references: [wells.id],
        },
    },
}
export const sequencingRunExternalSamplesRelations = relationsConfigToRelations(sequencingRunExternalSamples, sequencingRunExternalSamplesRelationsConfig)

const projectsRelationsConfig: RelationsConfig = {
    many: {
        targets: {
            table: targets,
            schema: createSelectSchema(targets),
            fields: [targets.projectId],
        }
    }
}
export const projectsRelations = relationsConfigToRelations(projects, projectsRelationsConfig)

const targetsRelationsConfig: RelationsConfig = {
    one:{
        project: {
            fields: [targets.projectId],
            referenceTable: projects,
            references: [projects.id],
        },
        region: {
            fields: [targets.regionId],
            referenceTable: regions,
            references: [regions.id],
        }
    },
    many: {
        transfectTargets: {
            table: transfectTargets,
            schema: createSelectSchema(transfectTargets),
            fields: [transfectTargets.targetId],
        },
        amplificationPrimers: {
            table: amplificationPrimers,
            schema: createSelectSchema(amplificationPrimers),
            fields: [amplificationPrimers.targetId],
        },
        linearizationPrimers: {
            table: linearizationPrimers,
            schema: createSelectSchema(linearizationPrimers),
            fields: [linearizationPrimers.targetId],
        },
        preseq1PrimerTargets: {
            table: preseq1PrimerTargets,
            schema: createSelectSchema(preseq1PrimerTargets),
            fields: [preseq1PrimerTargets.targetId],
        },
        preseq2Primers: {
            table: preseq2Primers,
            schema: createSelectSchema(preseq2Primers),
            fields: [preseq2Primers.targetId],
        },
        sgRnaPlasmidTargets: {
            table: sgRnaPlasmidTargets,
            schema: createSelectSchema(sgRnaPlasmidTargets),
            fields: [sgRnaPlasmidTargets.targetId],
        },
        snvLibPlasmids: {
            table: snvLibPlasmids,
            schema: createSelectSchema(snvLibPlasmids),
            fields: [snvLibPlasmids.targetId],
        },
    }
}
export const targetsRelations = relationsConfigToRelations(targets, targetsRelationsConfig)

const regionsRelationsConfig: RelationsConfig = {
    one:{
        gene: {
            fields: [regions.geneId],
            referenceTable: genes,
            references: [genes.id],
        }
    },
    many: {
        targets: {
            table: targets,
            schema: createSelectSchema(targets),
            fields: [targets.regionId]
        }
    }
}
export const regionsRelations = relationsConfigToRelations(regions, regionsRelationsConfig)

const cyclesRelationsConfig: RelationsConfig = {
    many: {
        transfectionExperiments: {
            table: transfectExperiments,
            schema: createSelectSchema(transfectExperiments),
            fields: [transfectExperiments.cycleId],
        }
    }
}
export const cyclesRelations = relationsConfigToRelations(cycles, cyclesRelationsConfig)

const transfectExperimentsRelationsConfig: RelationsConfig = {
    one:{
        technician: {
            fields: [transfectExperiments.technician],
            referenceTable: users,
            references: [users.id],
        },
        cycle: {
            fields: [transfectExperiments.cycleId],
            referenceTable: cycles,
            references: [cycles.id],
        },
    },
    many: {
        transfectTargets: {
            table: transfectTargets,
            schema: createSelectSchema(transfectTargets),
            fields: [transfectTargets.experimentId],
        },
        transfectLotUsage: {
            table: transfectLotUsage,
            schema: createSelectSchema(transfectLotUsage),
            fields: [transfectLotUsage.experimentId],
        }
    }
}
export const transfectExperimentsRelations = relationsConfigToRelations(transfectExperiments, transfectExperimentsRelationsConfig)

const transfectTargetsRelationsConfig: RelationsConfig = {
    one:{
        experiment: {
            fields: [transfectTargets.experimentId],
            referenceTable: transfectExperiments,
            references: [transfectExperiments.id],
        },
        target: {
            fields: [transfectTargets.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        snvLib: {
            fields: [transfectTargets.snvLibPlasmidId],
            referenceTable: snvLibPlasmids,
            references: [snvLibPlasmids.id],
        },
        sgRna: {
            fields: [transfectTargets.sgRnaPlasmidId],
            referenceTable: sgRnaPlasmids,
            references: [sgRnaPlasmids.id],
        },
    },
    many: {
        pellets: {
            table: pellets,
            schema: createSelectSchema(pellets),
            fields: [pellets.transfectTargetId]
        },
        pcrExperimentTargets: {
            table: pcrExperimentTargets,
            schema: createSelectSchema(pcrExperimentTargets),
            fields: [pcrExperimentTargets.transfectTargetId],
        },
    }
}
export const transfectTargetsRelations = relationsConfigToRelations(transfectTargets, transfectTargetsRelationsConfig)

const transfectLotUsageRelationsConfig: RelationsConfig = {
    one:{
        experiment: {
            fields: [transfectLotUsage.experimentId],
            referenceTable: transfectExperiments,
            references: [transfectExperiments.id],
        },
        lot: {
            fields: [transfectLotUsage.lotId],
            referenceTable: lots,
            references: [lots.id],
        },
    },
}
export const transfectLotUsageRelations = relationsConfigToRelations(transfectLotUsage, transfectLotUsageRelationsConfig)

const sgRnaCloningExperimentsRelationsConfig: RelationsConfig = {
    one:{
        technician: {
            fields: [sgRnaCloningExperiments.technician],
            referenceTable: users,
            references: [users.id],
        },
        plate: {
            fields: [sgRnaCloningExperiments.plateId],
            referenceTable: plates,
            references: [plates.id],
        },
    },
}
export const sgRnaCloningExperimentsRelations = relationsConfigToRelations(sgRnaCloningExperiments, sgRnaCloningExperimentsRelationsConfig)

const haCloningExperimentsRelationsConfig: RelationsConfig = {
    many: {
        haCloningExperimentTargets: {
            table: haCloningExperimentTargets,
            schema: createSelectSchema(haCloningExperimentTargets),
            fields: [haCloningExperimentTargets.haCloningExperimentId],
        },
        haPcrProducts: {
            table: haPcrProducts,
            schema: createSelectSchema(haPcrProducts),
            fields: [haPcrProducts.haCloningExperimentId],
        },
    },
}
export const haCloningExperimentsRelations = relationsConfigToRelations(haCloningExperiments, haCloningExperimentsRelationsConfig)

const haCloningExperimentTargetsRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [haCloningExperimentTargets.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        haCloningExperiment: {
            fields: [haCloningExperimentTargets.haCloningExperimentId],
            referenceTable: haCloningExperiments,
            references: [haCloningExperiments.id],
        }
    }
}
export const haCloningExperimentTargetsRelations = relationsConfigToRelations(haCloningExperimentTargets, haCloningExperimentTargetsRelationsConfig)

const haPcrProductsRelationsConfig: RelationsConfig = {
    one: {
        performedBy: {
            fields: [haPcrProducts.performedBy],
            referenceTable: users,
            references: [users.id],
        },
        haCloningExperiment: {
            fields: [haPcrProducts.haCloningExperimentId],
            referenceTable: haCloningExperiments,
            references: [haCloningExperiments.id],
        },
        haPrimerForward: {
            fields: [haPcrProducts.haPrimerForwardId],
            referenceTable: homologyArmPrimers,
            references: [homologyArmPrimers.id],
        },
        haPrimerReverse: {
            fields: [haPcrProducts.haPrimerReverseId],
            referenceTable: homologyArmPrimers,
            references: [homologyArmPrimers.id],
        },
        wellable: {
            fields: [haPcrProducts.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    many: {
        haPuc19PcrProducts: {
            table: haPuc19PcrProducts,
            schema: createSelectSchema(haPuc19PcrProducts),
            fields: [haPuc19PcrProducts.haPcrProductId],
        }
    }
}
export const haPcrProductsRelations = relationsConfigToRelations(haPcrProducts, haPcrProductsRelationsConfig)

const haPuc19PcrProductsRelationsConfig: RelationsConfig = {
    one: {
        cleanedBy: {
            fields: [haPuc19PcrProducts.cleanedBy],
            referenceTable: users,
            references: [users.id],
        },
        haPcrProduct: {
            fields: [haPuc19PcrProducts.haPcrProductId],
            referenceTable: haPcrProducts,
            references: [haPcrProducts.id],
        },
        haPuc19PrimerForward: {
            fields: [haPuc19PcrProducts.haPuc19PrimerForwardId],
            referenceTable: homologyArmPuc19Primers,
            references: [homologyArmPuc19Primers.id],
        },
        haPuc19PrimerReverse: {
            fields: [haPuc19PcrProducts.haPuc19PrimerReverseId],
            referenceTable: homologyArmPuc19Primers,
            references: [homologyArmPuc19Primers.id],
        },
        wellable: {
            fields: [haPuc19PcrProducts.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    many: {
        haPuc19GibsonProducts: {
            table: haPuc19GibsonProducts,
            schema: createSelectSchema(haPuc19GibsonProducts),
            fields: [haPuc19GibsonProducts.haPuc19PcrProductId],
        },
    }
}
export const haPuc19PcrProductsRelations = relationsConfigToRelations(haPuc19PcrProducts, haPuc19PcrProductsRelationsConfig)

const haPuc19GibsonProductsRelationsConfig: RelationsConfig = {
    one: {
        preppedBy: {
            fields: [haPuc19GibsonProducts.preppedBy],
            referenceTable: users,
            references: [users.id],
        },
        haPuc19PcrProduct: {
            fields: [haPuc19GibsonProducts.haPuc19PcrProductId],
            referenceTable: haPuc19PcrProducts,
            references: [haPuc19PcrProducts.id],
        },
        wellable: {
            fields: [haPuc19PcrProducts.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    many: {
        haPuc19Plasmids: {
            table: haPuc19Plasmids,
            schema: createSelectSchema(haPuc19Plasmids),
            fields: [haPuc19Plasmids.haPuc19GibsonProductId],
        },
    }
}
export const haPuc19GibsonProductsRelations = relationsConfigToRelations(haPuc19GibsonProducts, haPuc19GibsonProductsRelationsConfig)

const haPuc19PlasmidsRelationsConfig: RelationsConfig = {
    one: {
        preppedBy: {
            fields: [haPuc19Plasmids.preppedBy],
            referenceTable: users,
            references: [users.id],
        },
        colonyPickedBy: {
            fields: [haPuc19Plasmids.colonyPickedBy],
            referenceTable: users,
            references: [users.id],
        },
        transformedBy: {
            fields: [haPuc19Plasmids.transformedBy],
            referenceTable: users,
            references: [users.id],
        },
        haPuc19GibsonProduct: {
            fields: [haPuc19Plasmids.haPuc19GibsonProductId],
            referenceTable: haPuc19GibsonProducts,
            references: [haPuc19GibsonProducts.id],
        },
        wellable: {
            fields: [haPuc19Plasmids.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
}
export const haPuc19PlasmidsRelations = relationsConfigToRelations(haPuc19Plasmids, haPuc19PlasmidsRelationsConfig)

const clonalHasRelationsConfig: RelationsConfig = {
    many: {
        clonalHaTargets: {
            table: clonalHaTargets,
            schema: createSelectSchema(clonalHaTargets),
            fields: [clonalHaTargets.clonalHaId],
        }
    }
}
export const clonalHasRelations = relationsConfigToRelations(clonalHas, clonalHasRelationsConfig)

const clonalHaTargetsRelationsConfig: RelationsConfig = {
    one: {
        clonalHa: {
            fields: [clonalHaTargets.clonalHaId],
            referenceTable: clonalHas,
            references: [clonalHas.id],
        },
        target: {
            fields: [clonalHaTargets.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
    }
}
export const clonalHaTargetsRelations = relationsConfigToRelations(clonalHaTargets, clonalHaTargetsRelationsConfig)

const snvLibCloningExperimentsRelationsConfig: RelationsConfig = {
    one:{
        target: {
            fields: [snvLibCloningExperiments.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
    },
    many: {
        snvLibAmpProducts: {
            table: snvLibAmpProducts,
            schema: createSelectSchema(snvLibAmpProducts),
            fields: [snvLibAmpProducts.snvLibCloningExperimentId],
        },
        snvLibLinProducts: {
            table: snvLibLinProducts,
            schema: createSelectSchema(snvLibLinProducts),
            fields: [snvLibLinProducts.snvLibCloningExperimentId],
        },
        snvLibGibsonProducts: {
            table: snvLibGibsonProducts,
            schema: createSelectSchema(snvLibGibsonProducts),
            fields: [snvLibGibsonProducts.snvLibCloningExperimentId],
        },
        snvLibPlasmids: {
            table: snvLibPlasmids,
            schema: createSelectSchema(snvLibPlasmids),
            fields: [snvLibPlasmids.snvLibCloningExperimentId],
        },
        snvLibClonalDnaProducts: {
            table: snvLibClonalDnaProducts,
            schema: createSelectSchema(snvLibClonalDnaProducts),
            fields: [snvLibClonalDnaProducts.snvLibCloningExperimentId],
        },
        snvLibGoldenGateProducts: {
            table: snvLibGoldenGateProducts,
            schema: createSelectSchema(snvLibGoldenGateProducts),
            fields: [snvLibGoldenGateProducts.snvLibCloningExperimentId],
        },
    },
}
export const snvLibCloningExperimentsRelations = relationsConfigToRelations(snvLibCloningExperiments, snvLibCloningExperimentsRelationsConfig)

const snvLibAmpProductsRelationsConfig: RelationsConfig = {
    one: {
        cleanedBy: {
            fields: [snvLibAmpProducts.cleanedBy],
            referenceTable: users,
            references: [users.id],
        },
        snvLibCloningExperiment: {
            fields: [snvLibAmpProducts.snvLibCloningExperimentId],
            referenceTable: snvLibCloningExperiments,
            references: [snvLibCloningExperiments.id],
        },
        ampPrimerForward: {
            fields: [snvLibAmpProducts.ampPrimerForwardId],
            referenceTable: amplificationPrimers,
            references: [amplificationPrimers.id],
        },
        ampPrimerReverse: {
            fields: [snvLibAmpProducts.ampPrimerReverseId],
            referenceTable: amplificationPrimers,
            references: [amplificationPrimers.id],
        },
        twistLot: {
            fields: [snvLibAmpProducts.twistLotId],
            referenceTable: lots,
            references: [lots.id],
        },
        wellable: {
            fields: [snvLibAmpProducts.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
}
export const snvLibAmpProductsRelations = relationsConfigToRelations(snvLibAmpProducts, snvLibAmpProductsRelationsConfig)

const snvLibLinProductsRelationsConfig: RelationsConfig = {
    one: {
        dpn1DigestBy: {
            fields: [snvLibLinProducts.dpn1DigestBy],
            referenceTable: users,
            references: [users.id],
        },
        gelExtractedBy: {
            fields: [snvLibLinProducts.gelExtractedBy],
            referenceTable: users,
            references: [users.id],
        },
        snvLibCloningExperiment: {
            fields: [snvLibLinProducts.snvLibCloningExperimentId],
            referenceTable: snvLibCloningExperiments,
            references: [snvLibCloningExperiments.id],
        },
        linPrimerForward: {
            fields: [snvLibLinProducts.linPrimerForwardId],
            referenceTable: linearizationPrimers,
            references: [linearizationPrimers.id],
        },
        linPrimerReverse: {
            fields: [snvLibLinProducts.linPrimerReverseId],
            referenceTable: linearizationPrimers,
            references: [linearizationPrimers.id],
        },
        haPuc19Plasmid: {
            fields: [snvLibLinProducts.haPuc19PlasmidId],
            referenceTable: haPuc19Plasmids,
            references: [haPuc19Plasmids.id],
        },
        wellable: {
            fields: [snvLibLinProducts.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
}
export const snvLibLinProductsRelations = relationsConfigToRelations(snvLibLinProducts, snvLibLinProductsRelationsConfig)

const snvLibGibsonProductsRelationsConfig: RelationsConfig = {
    one: {
        gibsonBy: {
            fields: [snvLibGibsonProducts.gibsonBy],
            referenceTable: users,
            references: [users.id],
        },
        cleanedBy: {
            fields: [snvLibGibsonProducts.cleanedBy],
            referenceTable: users,
            references: [users.id],
        },
        transformedBy: {
            fields: [snvLibGibsonProducts.transformedBy],
            referenceTable: users,
            references: [users.id],
        },
        preppedBy: {
            fields: [snvLibGibsonProducts.preppedBy],
            referenceTable: users,
            references: [users.id],
        },
        snvLibCloningExperiment: {
            fields: [snvLibGibsonProducts.snvLibCloningExperimentId],
            referenceTable: snvLibCloningExperiments,
            references: [snvLibCloningExperiments.id]
        },
        wellable: {
            fields: [snvLibGibsonProducts.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
}
export const snvLibGibsonProductsRelations = relationsConfigToRelations(snvLibGibsonProducts, snvLibGibsonProductsRelationsConfig)

const snvLibClonalDnaProductsRelationsConfig: RelationsConfig = {
    one: {
        gelExtractedBy: {
            fields: [snvLibClonalDnaProducts.gelExtractedBy],
            referenceTable: users,
            references: [users.id],
        },
        snvLibCloningExperiment: {
            fields: [snvLibClonalDnaProducts.snvLibCloningExperimentId],
            referenceTable: snvLibCloningExperiments,
            references: [snvLibCloningExperiments.id],
        },
        wellable: {
            fields: [snvLibClonalDnaProducts.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
}
export const snvLibClonalDnaProductsRelations = relationsConfigToRelations(snvLibClonalDnaProducts, snvLibClonalDnaProductsRelationsConfig)

const snvLibGoldenGateProductsRelationsConfig: RelationsConfig = {
    one: {
        snvLibCloningExperiment: {
            fields: [snvLibClonalDnaProducts.snvLibCloningExperimentId],
            referenceTable: snvLibCloningExperiments,
            references: [snvLibCloningExperiments.id],
        },
        wellable: {
            fields: [snvLibClonalDnaProducts.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
        snvLibAmpProduct: {
            fields: [snvLibGoldenGateProducts.snvLibAmpProductId],
            referenceTable: snvLibAmpProducts,
            references: [snvLibAmpProducts.id],
        },
        snvLibClonalDnaProduct: {
            fields: [snvLibGoldenGateProducts.snvLibClonalDnaProductId],
            referenceTable: snvLibClonalDnaProducts,
            references: [snvLibClonalDnaProducts.id],
        },
    },
}
export const snvLibGoldenGateProductsRelations = relationsConfigToRelations(snvLibGoldenGateProducts, snvLibGoldenGateProductsRelationsConfig)

const extractionExperimentsRelationsConfig: RelationsConfig = {
    one:{
        technician: {
            fields: [extractionExperiments.technician],
            referenceTable: users,
            references: [users.id],
        },
    },
    many: {
        dna: {
            table: dna,
            schema: createSelectSchema(dna),
            fields: [dna.extractionExperimentId],
        },
        rna: {
            table: rna,
            schema: createSelectSchema(rna),
            fields: [rna.extractionExperimentId],
        },
        extractionLotUsage: {
            table: extractionLotUsage,
            schema: createSelectSchema(extractionLotUsage),
            fields: [extractionLotUsage.experimentId],
        }
    }
}
export const extractionExperimentsRelations = relationsConfigToRelations(extractionExperiments, extractionExperimentsRelationsConfig)

const extractionLotUsageRelationsConfig: RelationsConfig = {
    one:{
        experiment: {
            fields: [extractionLotUsage.experimentId],
            referenceTable: extractionExperiments,
            references: [extractionExperiments.id],
        },
        lot: {
            fields: [extractionLotUsage.lotId],
            referenceTable: lots,
            references: [lots.id],
        },
    },
}
export const extractionLotUsageRelations = relationsConfigToRelations(extractionLotUsage, extractionLotUsageRelationsConfig)

const pelletsRelationsConfig: RelationsConfig = {
    one:{
        harvestedBy: {
            fields: [pellets.harvestedBy],
            referenceTable: users,
            references: [users.id],
        },
        transfectTarget: {
            fields: [pellets.transfectTargetId],
            referenceTable: transfectTargets,
            references: [transfectTargets.id],
        },
        wellable: {
            fields: [pellets.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    oneToOne: {
        nucleicAcid: {
            table: nucleicAcids
        },
        dna: {
            table: dna
        },
        rna: {
            table: rna
        },
    // many: {
        // wellContents: {
        //     table: wellContents
        // },
    },
}
export const pelletsRelations = relationsConfigToRelations(pellets, pelletsRelationsConfig)

const lotsRelationsConfig: RelationsConfig = {
    one: {
        reagent: {
            fields: [lots.reagent],
            referenceTable: reagents,
            references: [reagents.id],
        },
    },
}
export const lotsRelations = relationsConfigToRelations(lots, lotsRelationsConfig)

const sgRnaPlasmidsRelationsConfig: RelationsConfig = {
    one: {
        // target: {
        //     fields: [sgRnaPlasmids.targetId],
        //     referenceTable: targets,
        //     references: [targets.id],
        // },
        wellable: {
            fields: [sgRnaPlasmids.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    many: {
        sgRnaPlasmidTargets: {
            table: sgRnaPlasmidTargets,
            schema: createSelectSchema(sgRnaPlasmidTargets),
            fields: [sgRnaPlasmidTargets.sgRnaPlasmidId],
        }
    },
}
export const sgRnaPlasmidsRelations = relationsConfigToRelations(sgRnaPlasmids, sgRnaPlasmidsRelationsConfig)

const sgRnaPlasmidTargetsRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [sgRnaPlasmidTargets.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        sgRnaPlasmid: {
            fields: [sgRnaPlasmidTargets.sgRnaPlasmidId],
            referenceTable: sgRnaPlasmids,
            references: [sgRnaPlasmids.id],
        },
    }
}
export const sgRnaPlasmidTargetsRelations = relationsConfigToRelations(sgRnaPlasmidTargets, sgRnaPlasmidTargetsRelationsConfig)

const snvLibPlasmidsRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [snvLibPlasmids.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        snvLibCloningExperiment: {
            fields: [snvLibPlasmids.snvLibCloningExperimentId],
            referenceTable: snvLibCloningExperiments,
            references: [snvLibCloningExperiments.id],
        },
        wellable: {
            fields: [snvLibPlasmids.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    // many: {
    //     wellContents: {
    //         table: wellContents,
    //         schema: createSelectSchema(wellContents),
    //         fields: [wellContents.snvLibPlasmidId],
    //     }
    // },
}
export const snvLibPlasmidsRelations = relationsConfigToRelations(snvLibPlasmids, snvLibPlasmidsRelationsConfig)

const nucleicAcidsRelationsConfig: RelationsConfig = {
    one: {
        extractionExperiment: {
            fields: [nucleicAcids.extractionExperimentId],
            referenceTable: extractionExperiments,
            references: [extractionExperiments.id],
        },
        pellet: {
            fields: [nucleicAcids.pelletId],
            referenceTable: pellets,
            references: [pellets.id],
        },
        wellable: {
            fields: [nucleicAcids.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    // many: {
    //     wellContents: {
    //         table: wellContents,
    //         schema: createSelectSchema(wellContents),
    //         fields: [wellContents.nucleicAcidId],
    //     }
    // },
}
export const nucleicAcidsRelations = relationsConfigToRelations(nucleicAcids, nucleicAcidsRelationsConfig)

const dnaRelationsConfig: RelationsConfig = {
    one: {
        extractionExperiment: {
            fields: [dna.extractionExperimentId],
            referenceTable: extractionExperiments,
            references: [extractionExperiments.id],
        },
        pellet: {
            fields: [dna.pelletId],
            referenceTable: pellets,
            references: [pellets.id],
        },
        wellable: {
            fields: [dna.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
}
export const dnaRelations = relationsConfigToRelations(dna, dnaRelationsConfig)

const rnaRelationsConfig: RelationsConfig = {
    one: {
        extractionExperiment: {
            fields: [rna.extractionExperimentId],
            referenceTable: extractionExperiments,
            references: [extractionExperiments.id],
        },
        pellet: {
            fields: [rna.pelletId],
            referenceTable: pellets,
            references: [pellets.id],
        },
        wellable: {
            fields: [rna.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
}
export const rnaRelations = relationsConfigToRelations(rna, rnaRelationsConfig)

const sgRnaOligosRelationsConfig: RelationsConfig = {
    one: {
        wellable: {
            fields: [sgRnaOligos.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    many: {
        sgRnaOligoTargets: {
            table: sgRnaOligoTargets,
            schema: createSelectSchema(sgRnaOligoTargets),
            fields: [sgRnaOligoTargets.sgRnaOligoId],
        }
    },
}
export const sgRnaOligosRelations = relationsConfigToRelations(sgRnaOligos, sgRnaOligosRelationsConfig)

const sgRnaOligoTargetsRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [sgRnaOligoTargets.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        sgRnaOligo: {
            fields: [sgRnaOligoTargets.sgRnaOligoId],
            referenceTable: sgRnaOligos,
            references: [sgRnaOligos.id],
        },
    }
}
export const sgRnaOligoTargetsRelations = relationsConfigToRelations(sgRnaOligoTargets, sgRnaOligoTargetsRelationsConfig)

const amplificationPrimersRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [amplificationPrimers.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        wellable: {
            fields: [amplificationPrimers.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    // oneToOne: {
    //     wellContents: {
    //         table: wellContents
    //     }
    // },
}
export const amplificationPrimersRelations = relationsConfigToRelations(amplificationPrimers, amplificationPrimersRelationsConfig)

const linearizationPrimersRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [linearizationPrimers.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        wellable: {
            fields: [linearizationPrimers.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    // oneToOne: {
    //     wellContents: {
    //         table: wellContents
    //     }
    // },
}
export const linearizationPrimersRelations = relationsConfigToRelations(linearizationPrimers, linearizationPrimersRelationsConfig)

const homologyArmPrimersRelationsConfig: RelationsConfig = {
    one: {
        wellable: {
            fields: [homologyArmPrimers.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    many: {
        targets: {
            table: homologyArmPrimerTargets,
            schema: createSelectSchema(homologyArmPrimerTargets),
            fields: [homologyArmPrimerTargets.homologyArmPrimerId],
        }
    },
}
export const homologyArmPrimersRelations = relationsConfigToRelations(homologyArmPrimers, homologyArmPrimersRelationsConfig)

const homologyArmPrimerTargetsRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [homologyArmPrimerTargets.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        homologyArmPrimer: {
            fields: [homologyArmPrimerTargets.homologyArmPrimerId],
            referenceTable: homologyArmPrimers,
            references: [homologyArmPrimers.id],
        }
    }
}
export const homologyArmPrimerTargetsRelations = relationsConfigToRelations(homologyArmPrimerTargets, homologyArmPrimerTargetsRelationsConfig)

const homologyArmPuc19PrimersRelationsConfig: RelationsConfig = {
    one: {
        homologyArmPrimer: {
            fields: [homologyArmPuc19Primers.homologyArmPrimerId],
            referenceTable: homologyArmPrimers,
            references: [homologyArmPrimers.id],
        },
        wellable: {
            fields: [homologyArmPuc19Primers.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
}
export const homologyArmPuc19PrimersRelations = relationsConfigToRelations(homologyArmPuc19Primers, homologyArmPuc19PrimersRelationsConfig)

const indexPrimersRelationsConfig: RelationsConfig = {
    one: {
        wellable: {
            fields: [indexPrimers.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
}
export const indexPrimersRelations = relationsConfigToRelations(indexPrimers, indexPrimersRelationsConfig)

const preseq1PrimersRelationsConfig: RelationsConfig = {
    one: {
        wellable: {
            fields: [preseq1Primers.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    many: {
        preseq1PrimerTargets: {
            table: preseq1PrimerTargets,
            schema: createSelectSchema(preseq1PrimerTargets),
            fields: [preseq1PrimerTargets.preseq1PrimerId],
        }
    },
}
export const preseq1PrimersRelations = relationsConfigToRelations(preseq1Primers, preseq1PrimersRelationsConfig)

const preseq1PrimerTargetsRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [preseq1PrimerTargets.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        preseq1Primer: {
            fields: [preseq1PrimerTargets.preseq1PrimerId],
            referenceTable: preseq1Primers,
            references: [preseq1Primers.id],
        },
    },
}
export const preseq1PrimerTargetsRelations = relationsConfigToRelations(preseq1PrimerTargets, preseq1PrimerTargetsRelationsConfig)

const preseq2PrimersRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [preseq2Primers.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        wellable: {
            fields: [preseq2Primers.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
}
export const preseq2PrimersRelations = relationsConfigToRelations(preseq2Primers, preseq2PrimersRelationsConfig)

const rnaPreseq1PrimersRelationsConfig: RelationsConfig = {
    one: {
        wellable: {
            fields: [rnaPreseq1Primers.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    many: {
        rnaPreseq1PrimerTargets: {
            table: rnaPreseq1PrimerTargets,
            schema: createSelectSchema(rnaPreseq1PrimerTargets),
            fields: [rnaPreseq1PrimerTargets.rnaPreseq1PrimerId],
        }
    },
}
export const rnaPreseq1PrimersRelations = relationsConfigToRelations(rnaPreseq1Primers, rnaPreseq1PrimersRelationsConfig)

const rnaPreseq1PrimerTargetsRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [rnaPreseq1PrimerTargets.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        rnaPreseq1Primer: {
            fields: [rnaPreseq1PrimerTargets.rnaPreseq1PrimerId],
            referenceTable: rnaPreseq1Primers,
            references: [rnaPreseq1Primers.id],
        },
    },
}
export const rnaPreseq1PrimerTargetsRelations = relationsConfigToRelations(rnaPreseq1PrimerTargets, rnaPreseq1PrimerTargetsRelationsConfig)

const rnaPreseq2PrimersRelationsConfig: RelationsConfig = {
    one: {
        wellable: {
            fields: [rnaPreseq2Primers.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    many: {
        rnaPreseq2PrimerTargets: {
            table: rnaPreseq2PrimerTargets,
            schema: createSelectSchema(rnaPreseq2PrimerTargets),
            fields: [rnaPreseq2PrimerTargets.rnaPreseq2PrimerId],
        }
    }
}
export const rnaPreseq2PrimersRelations = relationsConfigToRelations(rnaPreseq2Primers, rnaPreseq2PrimersRelationsConfig)

const rnaPreseq2PrimerTargetsRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [rnaPreseq2PrimerTargets.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        rnaPreseq2Primer: {
            fields: [rnaPreseq2PrimerTargets.rnaPreseq2PrimerId],
            referenceTable: rnaPreseq2Primers,
            references: [rnaPreseq2Primers.id],
        },
    },
}
export const rnaPreseq2PrimerTargetsRelations = relationsConfigToRelations(rnaPreseq2PrimerTargets, rnaPreseq2PrimerTargetsRelationsConfig)

const rnaRtPrimersRelationsConfig: RelationsConfig = {
    one: {
        wellable: {
            fields: [rnaRtPrimers.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
        gene: {
            fields: [rnaRtPrimers.geneId],
            referenceTable: genes,
            references: [genes.id],
        },
    },
}
export const rnaRtPrimersRelations = relationsConfigToRelations(rnaRtPrimers, rnaRtPrimersRelationsConfig)

export const relationsConfigs: { [tableName: string] : RelationsConfig } = {
    wellContents: wellContentsRelationsConfig,
    wellables: wellablesRelationsConfig,
    wellContentSources: wellContentSourcesRelationsConfig,
    wells: wellsRelationsConfig,
    plates: platesRelationsConfig,
    projects: projectsRelationsConfig,
    targets: targetsRelationsConfig,
    regions: regionsRelationsConfig,
    genes: genesRelationsConfig,
    sgRnaPlasmids: sgRnaPlasmidsRelationsConfig,
    sgRnaPlasmidTargets: sgRnaPlasmidTargetsRelationsConfig,
    snvLibPlasmids: snvLibPlasmidsRelationsConfig,
    dna: dnaRelationsConfig,
    rna: rnaRelationsConfig,
    sgRnaOligos: sgRnaOligosRelationsConfig,
    sgRnaOligoTargets: sgRnaOligoTargetsRelationsConfig,
    cycles: cyclesRelationsConfig,
    haPcrProducts: haPcrProductsRelationsConfig,
    haPuc19PcrProducts: haPuc19PcrProductsRelationsConfig,
    haPuc19GibsonProducts: haPuc19GibsonProductsRelationsConfig,
    haPuc19Plasmids: haPuc19PlasmidsRelationsConfig,
    clonalHas: clonalHasRelationsConfig,
    clonalHaTargets: clonalHaTargetsRelationsConfig,
    pcrExperiments: pcrExperimentsRelationsConfig,
    pcrExperimentTargets: pcrExperimentTargetsRelationsConfig,
    sgRnaCloningExperiments: sgRnaCloningExperimentsRelationsConfig,
    haCloningExperimentTargets: haCloningExperimentTargetsRelationsConfig,
    haCloningExperiments: haCloningExperimentsRelationsConfig,
    snvLibCloningExperiments: snvLibCloningExperimentsRelationsConfig,
    snvLibAmpProducts: snvLibAmpProductsRelationsConfig,
    snvLibLinProducts: snvLibLinProductsRelationsConfig,
    snvLibGibsonProducts: snvLibGibsonProductsRelationsConfig,
    snvLibClonalDnaProducts: snvLibClonalDnaProductsRelationsConfig,
    snvLibGoldenGateProducts: snvLibGoldenGateProductsRelationsConfig,
    transfectExperiments: transfectExperimentsRelationsConfig,
    extractionExperiments: extractionExperimentsRelationsConfig,
    transfectLotUsageRelations: transfectLotUsageRelationsConfig,
    extractionLotUsageRelations: extractionLotUsageRelationsConfig,
    pellets: pelletsRelationsConfig,
    lots: lotsRelationsConfig,
    amplificationPrimers: amplificationPrimersRelationsConfig,
    linearizationPrimers: linearizationPrimersRelationsConfig,
    homologyArmPrimers: homologyArmPrimersRelationsConfig,
    preseq1Primers: preseq1PrimersRelationsConfig,
    preseq1PrimerTargets: preseq1PrimerTargetsRelationsConfig,
    preseq2Primers: preseq2PrimersRelationsConfig,
    rnaPreseq1Primers: rnaPreseq1PrimersRelationsConfig,
    rnaPreseq1PrimerTargets: rnaPreseq1PrimerTargetsRelationsConfig,
    rnaPreseq2Primers: rnaPreseq2PrimersRelationsConfig,
    rnaPreseq2PrimerTargets: rnaPreseq2PrimerTargetsRelationsConfig,
    rnaRtPrimers: rnaRtPrimersRelationsConfig,
    indexPrimers: indexPrimersRelationsConfig,
    sequencingRuns: sequencingRunsRelationsConfig,
    sequencingRunSamples: sequencingRunSamplesRelationsConfig,
    externalSamples: externalSamplesRelationsConfig,
    sequencingRunExternalSamples: sequencingRunExternalSamplesRelationsConfig,
}
