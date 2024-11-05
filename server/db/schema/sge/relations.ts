import { relations } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { pcrExperiments } from './pcr-experiment'
import { plates } from './plate'
import { wells } from './well'
import { users } from '../user'


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
  
export const pcrExperimentsRelations = relations(pcrExperiments, ({ one, many }) => (
    _.mapValues(pcrExperimentsRelationsConfig.one, (x) => {
        return one(x.referenceTable, {
        fields: x.fields,
        references: x.references,
        })
    }),
    _.mapValues(pcrExperimentsRelationsConfig.many, (x) => {
        if (x.relationName) {
            console.log(x.relationName)
            return many(x.table, {relationName: x.relationName})
        } else {
            return many(x.table)
        }
    })
))


export const wellsRelationsConfig: RelationsConfig = {
    one:{
        plateId: {
            fields: [wells.plateId],
            referenceTable: plates,
            references: [plates.id],
        },
    },
    many: {
    }
}

export const wellsRelations = relations(wells, ({ one }) => (
    _.mapValues(wellsRelationsConfig.one, (x) => {
        return one(x.referenceTable, {
        fields: x.fields,
        references: x.references,
        })
    })
))

export const platesRelationsConfig: RelationsConfig = {
    one:{
        pcrExperiment: {
            fields: [plates.pcrExperimentId],
            referenceTable: pcrExperiments,
            references: [pcrExperiments.id],
            // relationName: "plates"
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

export const platesRelations = relations(plates, ({ one, many }) => (
    _.mapValues(platesRelationsConfig.one, (x) => {
        return one(x.referenceTable, {
            fields: x.fields,
            references: x.references,
        })
    }),
    _.mapValues(platesRelationsConfig.many, (x) => {
        return many(x.table)
    })
))
