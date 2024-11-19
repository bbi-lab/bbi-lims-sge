import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { pcrExperiments } from './pcr-experiment'
import { harvestExperiments } from './harvest-experiment'
import { plasmidExperiments } from './plasmid-experiment'
import { plates } from './plate'
import { wells } from './well'
import { users } from '../user'
import { projects } from './project'
import { targets } from './target'
import { genes } from './gene'
import { regions } from './region'
import { cycles } from './cycle'
import { relationsConfigToRelations } from '../relations'

export const pcrExperimentsRelationsConfig: RelationsConfig = {
    one:{
        technician: {
            fields: [pcrExperiments.technician],
            referenceTable: users,
            references: [users.id],
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

export const wellsRelationsConfig: RelationsConfig = {
    one:{
        plateId: {
            fields: [wells.plateId],
            referenceTable: plates,
            references: [plates.id],
        },
    },
    many: {}
}
export const wellsRelations = relationsConfigToRelations(wells, wellsRelationsConfig)

export const platesRelationsConfig: RelationsConfig = {
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

export const projectsRelationsConfig: RelationsConfig = {
    one:{},
    many: {
        targets: {
            table: targets,
            schema: createSelectSchema(targets),
            fields: [targets.projectId],
        }
    }
}
export const projectsRelations = relationsConfigToRelations(projects, projectsRelationsConfig)

export const targetsRelationsConfig: RelationsConfig = {
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
    many: {}
}
export const targetsRelations = relationsConfigToRelations(targets, targetsRelationsConfig)

export const regionsRelationsConfig: RelationsConfig = {
    one:{
        gene: {
            fields: [regions.geneId],
            referenceTable: genes,
            references: [genes.id],
        }
    },
    many: {}
}
export const regionsRelations = relationsConfigToRelations(regions, regionsRelationsConfig)

export const cyclesRelationsConfig: RelationsConfig = {
    one: {},
    many: {
        targets: {
            table: targets,
            schema: createSelectSchema(targets),
            fields: [targets.cycleId],
        }
    }
}
export const cyclesRelations = relationsConfigToRelations(cycles, cyclesRelationsConfig)

export const harvestExperimentsRelationsConfig: RelationsConfig = {
    one:{
        technician: {
            fields: [harvestExperiments.technician],
            referenceTable: users,
            references: [users.id],
        },
    },
    many: {}
}
export const harvestExperimentsRelations = relationsConfigToRelations(harvestExperiments, harvestExperimentsRelationsConfig)

export const plasmidExperimentsRelationsConfig: RelationsConfig = {
    one:{
        technician: {
            fields: [plasmidExperiments.technician],
            referenceTable: users,
            references: [users.id],
        },
    },
    many: {}
}
export const plasmidExperimentsRelations = relationsConfigToRelations(plasmidExperiments, plasmidExperimentsRelationsConfig)
