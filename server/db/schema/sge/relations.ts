import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { pcrExperiments } from './pcr-experiment'
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
import { nucleicAcids } from './nucleic-acid'
import { amplificationPrimers, homologyArmPrimers, homologyArmPrimerTargets, homologyArmPuc19Primers, indexPrimers, linearizationPrimers, preseq1Primers, preseq2Primers } from './primer'
import { sequencingRuns, sequencingRunSamples, sequencingRunExternalSamples } from './sequencing-run'
import { haPcrProducts, haPuc19GibsonProducts, haPuc19PcrProducts, sgRnaOligos } from './oligos'
import { haPuc19Plasmids, sgRnaPlasmids, snvLibPlasmids } from './plasmid'
import { sgRnaCloningExperiments, snvLibCloningExperiments, haCloningExperiments, haCloningExperimentTargets } from './plasmid-experiment'
import { externalSamples } from './external-samples'

const genesRelationsConfig: RelationsConfig = {
    many: {
        regions: {
            table: regions,
            schema: createSelectSchema(regions),
            fields: [regions.geneId]
        }
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
        transfectTarget: {
            fields: [pcrExperiments.transfectTargetId],
            referenceTable: transfectTargets,
            references: [transfectTargets.id],
        },
    },
    many: {
        plates: {
            table: plates,
            schema: createSelectSchema(plates),
            fields: [plates.pcrExperimentId],
        }
    }
}
export const pcrExperimentsRelations = relationsConfigToRelations(pcrExperiments, pcrExperimentsRelationsConfig)

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
    one:{
        pcrExperiment: {
            fields: [plates.pcrExperimentId],
            referenceTable: pcrExperiments,
            references: [pcrExperiments.id],
        },
        sgRnaCloningExperiment: {
            fields: [plates.sgRnaCloningExperimentId],
            referenceTable: sgRnaCloningExperiments,
            references: [sgRnaCloningExperiments.id],
        },
        snvLibCloningExperiment: {
            fields: [plates.snvLibCloningExperimentId],
            referenceTable: snvLibCloningExperiments,
            references: [snvLibCloningExperiments.id],
        },
    },
    many: {
        wells: {
            table: wells,
            schema: createSelectSchema(wells),
            fields: [wells.plateId],
        }
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
        nucleicAcid: {
            fields: [sequencingRunSamples.nucleicAcidId],
            referenceTable: nucleicAcids,
            references: [nucleicAcids.id],
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
        preseq1Primers: {
            table: preseq1Primers,
            schema: createSelectSchema(preseq1Primers),
            fields: [preseq1Primers.targetId],
        },
        preseq2Primers: {
            table: preseq2Primers,
            schema: createSelectSchema(preseq2Primers),
            fields: [preseq2Primers.targetId],
        },
        sgRnaPlasmids: {
            table: sgRnaPlasmids,
            schema: createSelectSchema(sgRnaPlasmids),
            fields: [sgRnaPlasmids.targetId],
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
        }
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
    },
    many: {
        plates: {
            table: plates,
            schema: createSelectSchema(plates),
            fields: [plates.sgRnaCloningExperimentId],
        },
    }
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
}
export const haPuc19PcrProductsRelations = relationsConfigToRelations(haPuc19PcrProducts, haPuc19PcrProductsRelationsConfig)

const snvLibCloningExperimentsRelationsConfig: RelationsConfig = {
    one:{
        technician: {
            fields: [snvLibCloningExperiments.technician],
            referenceTable: users,
            references: [users.id],
        },
    },
    many: {
        snvLibPlasmids: {
            table: snvLibPlasmids,
            schema: createSelectSchema(snvLibPlasmids),
            fields: [snvLibPlasmids.snvLibCloningExperimentId],
        },
        plates: {
            table: plates,
            schema: createSelectSchema(plates),
            fields: [plates.snvLibCloningExperimentId],
        },
    }
}
export const snvLibCloningExperimentsRelations = relationsConfigToRelations(snvLibCloningExperiments, snvLibCloningExperimentsRelationsConfig)

const extractionExperimentsRelationsConfig: RelationsConfig = {
    one:{
        technician: {
            fields: [extractionExperiments.technician],
            referenceTable: users,
            references: [users.id],
        },
    },
    many: {
        nucleicAcids: {
            table: nucleicAcids,
            schema: createSelectSchema(nucleicAcids),
            fields: [nucleicAcids.extractionExperimentId],
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
        target: {
            fields: [sgRnaPlasmids.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        wellable: {
            fields: [sgRnaPlasmids.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    // many: {
    //     wellContents: {
    //         table: wellContents,
    //         schema: createSelectSchema(wellContents),
    //         fields: [wellContents.sgRnaPlasmidId],
    //     }
    // },
}
export const sgRnaPlasmidsRelations = relationsConfigToRelations(sgRnaPlasmids, sgRnaPlasmidsRelationsConfig)

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

const sgRnaOligosRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [sgRnaOligos.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        wellable: {
            fields: [sgRnaOligos.id],
            referenceTable: wellables,
            references: [wellables.id],
        },
    },
    // many: {
    //     wellContents: {
    //         table: wellContents,
    //         schema: createSelectSchema(wellContents),
    //         fields: [wellContents.sgRnaOligoId],
    //     }
    // },
}
export const sgRnaOligosRelations = relationsConfigToRelations(sgRnaOligos, sgRnaOligosRelationsConfig)

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
    // many: {
    //     wellContents: {
    //         table: wellContents,
    //         schema: createSelectSchema(wellContents),
    //         fields: [wellContents.indexPrimerId],
    //     },
    // },
}
export const indexPrimersRelations = relationsConfigToRelations(indexPrimers, indexPrimersRelationsConfig)

const preseq1PrimersRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [preseq1Primers.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        wellable: {
            fields: [preseq1Primers.id],
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
export const preseq1PrimersRelations = relationsConfigToRelations(preseq1Primers, preseq1PrimersRelationsConfig)

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
    // oneToOne: {
    //     wellContents: {
    //         table: wellContents
    //     }
    // },
}
export const preseq2PrimersRelations = relationsConfigToRelations(preseq2Primers, preseq2PrimersRelationsConfig)

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
    snvLibPlasmids: snvLibPlasmidsRelationsConfig,
    nucleicAcids: nucleicAcidsRelationsConfig,
    sgRnaOligos: sgRnaOligosRelationsConfig,
    cycles: cyclesRelationsConfig,
    pcrExperiments: pcrExperimentsRelationsConfig,
    sgRnaCloningExperiments: sgRnaCloningExperimentsRelationsConfig,
    haCloningExperimentTargets: haCloningExperimentTargetsRelationsConfig,
    haCloningExperiments: haCloningExperimentsRelationsConfig,
    snvLibCloningExperiments: snvLibCloningExperimentsRelationsConfig,
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
    preseq2Primers: preseq2PrimersRelationsConfig,
    indexPrimers: indexPrimersRelationsConfig,
    sequencingRuns: sequencingRunsRelationsConfig,
    sequencingRunSamples: sequencingRunSamplesRelationsConfig,
    externalSamples: externalSamplesRelationsConfig,
    sequencingRunExternalSamples: sequencingRunExternalSamplesRelationsConfig,
}
