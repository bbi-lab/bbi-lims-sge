import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { pcrExperiments } from './pcr-experiment'
import { transfectExperiments, transfectTargets, transfectLotUsage } from './transfect-experiment'
import { plasmidExperiments } from './plasmid-experiment'
import { extractionExperiments, extractionLotUsage } from './extraction-experiment'
import { plates } from './plate'
import { wellContents, wellContentSources, wells } from './well'
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
import { plasmids } from './plasmid'
import { nucleicAcids } from './nucleic-acid'
import { amplificationPrimers, homologyArmPrimers, indexPrimers, linearizationPrimers } from './primer'

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
        cycle: {
            fields: [pcrExperiments.cycleId],
            referenceTable: cycles,
            references: [cycles.id],
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
        amplificationPrimer: {
            fields: [wellContents.amplificationPrimerId],
            referenceTable: amplificationPrimers,
            references: [amplificationPrimers.id],
        },
        linearizationPrimer: {
            fields: [wellContents.linearizationPrimerId],
            referenceTable: linearizationPrimers,
            references: [linearizationPrimers.id],
        },
        homologyArmPrimer: {
            fields: [wellContents.homologyArmPrimerId],
            referenceTable: homologyArmPrimers,
            references: [homologyArmPrimers.id],
        },
        indexPrimer: {
            fields: [wellContents.indexPrimerId],
            referenceTable: indexPrimers,
            references: [indexPrimers.id],
        },
        nucleicAcid: {
            fields: [wellContents.nucleicAcidId],
            referenceTable: nucleicAcids,
            references: [nucleicAcids.id],
        },
        pellet: {
            fields: [wellContents.pelletId],
            referenceTable: pellets,
            references: [pellets.id],
        },
    },
}
export const wellContentsRelations = relationsConfigToRelations(wellContents, wellContentsRelationsConfig)

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

// const wellSourcesRelationsConfig: RelationsConfig = {
//     one: {
//         sourceWell: {
//             fields: [wellSources.sourceWellId],
//             referenceTable: wells,
//             references: [wells.id],
//         },
//         destWell: {
//             fields: [wellSources.destWellId],
//             referenceTable: wells,
//             references: [wells.id],
//         },
//         createdBy: {
//             fields: [wellSources.createdBy],
//             referenceTable: users,
//             references: [users.id],
//         },
//     },
// }
// export const wellSourcesRelations = relationsConfigToRelations(wellSources, wellSourcesRelationsConfig)

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
        }
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
        cycle: {
            fields: [targets.cycleId],
            referenceTable: cycles,
            references: [cycles.id],
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
        }
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
        targets: {
            table: targets,
            schema: createSelectSchema(targets),
            fields: [targets.cycleId],
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

const plasmidExperimentsRelationsConfig: RelationsConfig = {
    one:{
        technician: {
            fields: [plasmidExperiments.technician],
            referenceTable: users,
            references: [users.id],
        },
    },
}
export const plasmidExperimentsRelations = relationsConfigToRelations(plasmidExperiments, plasmidExperimentsRelationsConfig)

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
    },
    oneToOne: {
        nucleicAcid: {
            table: nucleicAcids
        },
        wellContents: {
            table: wellContents
        },
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

const plasmidsRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [plasmids.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
        plasmidExperiment: {
            fields: [plasmids.plasmidExperimentId],
            referenceTable: plasmidExperiments,
            references: [plasmidExperiments.id],
        },
    },
}
export const plasmidsRelations = relationsConfigToRelations(plasmids, plasmidsRelationsConfig)

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
    },
    oneToOne: {
        wellContents: {
            table: wellContents
        }
    },
}
export const nucleicAcidsRelations = relationsConfigToRelations(nucleicAcids, nucleicAcidsRelationsConfig)

const amplificationPrimersRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [amplificationPrimers.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
    },
    oneToOne: {
        wellContents: {
            table: wellContents
        }
    },
}
export const amplificationPrimersRelations = relationsConfigToRelations(amplificationPrimers, amplificationPrimersRelationsConfig)

const linearizationPrimersRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [linearizationPrimers.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
    },
    oneToOne: {
        wellContents: {
            table: wellContents
        }
    },
}
export const linearizationPrimersRelations = relationsConfigToRelations(linearizationPrimers, linearizationPrimersRelationsConfig)

const homologyArmPrimersRelationsConfig: RelationsConfig = {
    one: {
        target: {
            fields: [homologyArmPrimers.targetId],
            referenceTable: targets,
            references: [targets.id],
        },
    },
    oneToOne: {
        wellContents: {
            table: wellContents
        }
    },
}
export const homologyArmPrimersRelations = relationsConfigToRelations(homologyArmPrimers, homologyArmPrimersRelationsConfig)

const indexPrimersRelationsConfig: RelationsConfig = {
    many: {
        wellContents: {
            table: wellContents,
            schema: createSelectSchema(wellContents),
            fields: [wellContents.indexPrimerId],
        },
    },
}
export const indexPrimersRelations = relationsConfigToRelations(indexPrimers, indexPrimersRelationsConfig)

export const relationsConfigs: { [tableName: string] : RelationsConfig } = {
    wellContents: wellContentsRelationsConfig,
    wellContentSources: wellContentSourcesRelationsConfig,
    // wellSources: wellSourcesRelationsConfig,
    wells: wellsRelationsConfig,
    plates: platesRelationsConfig,
    projects: projectsRelationsConfig,
    targets: targetsRelationsConfig,
    regions: regionsRelationsConfig,
    genes: genesRelationsConfig,
    plasmids: plasmidsRelationsConfig,
    nucleicAcids: nucleicAcidsRelationsConfig,
    cycles: cyclesRelationsConfig,
    pcrExperiments: pcrExperimentsRelationsConfig,
    plasmidExperiments: plasmidExperimentsRelationsConfig,
    transfectExperiments: transfectExperimentsRelationsConfig,
    extractionExperiments: extractionExperimentsRelationsConfig,
    transfectLotUsageRelations: transfectLotUsageRelationsConfig,
    extractionLotUsageRelations: extractionLotUsageRelationsConfig,
    pellets: pelletsRelationsConfig,
    lots: lotsRelationsConfig,
    amplificationPrimers: amplificationPrimersRelationsConfig,
    linearizationPrimers: linearizationPrimersRelationsConfig,
    homologyArmPrimers: homologyArmPrimersRelationsConfig,
    indexPrimers: indexPrimersRelationsConfig,
}
