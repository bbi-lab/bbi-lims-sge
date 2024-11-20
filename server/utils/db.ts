import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { PgTableWithColumns, AnyPgColumn } from 'drizzle-orm/pg-core'
import {users, userGroups, userGroupMemberships} from '../db/schema/user';

import {specimens} from '../db/schema/specimen';
import {geneGroups} from '../db/schema/gene-group'
import {pcrExperiments} from '../db/schema/sge/pcr-experiment'
import {plates} from '../db/schema/sge/plate'
import {wells} from '../db/schema/sge/well'
import {projects} from '../db/schema/sge/project'
import {targets} from '../db/schema/sge/target'
import {genes} from '../db/schema/sge/gene'
import {regions} from '../db/schema/sge/region'
import {cycles} from '../db/schema/sge/cycle'
import { harvestExperiments } from '../db/schema/sge/harvest-experiment'
import { plasmidExperiments } from '../db/schema/sge/plasmid-experiment'
import { extractionExperiments } from '../db/schema/sge/extraction-experiment'
import {
  pcrExperimentsRelations,
  platesRelations,
  wellsRelations,
  projectsRelations,
  targetsRelations,
  regionsRelations,
  cyclesRelations,
  plasmidExperimentsRelations,
  harvestExperimentsRelations,
  extractionExperimentsRelations,
} from '../db/schema/sge/relations'
import {usersRelations, userGroupsRelations, userGroupMembershipsRelations} from '../db/schema/relations'
import {ZodObject} from 'zod'
import _ from 'lodash'


// By checking whether useRuntimeConfig is defined, we support use outside the Nuxt lifecycle.
const config = typeof useRuntimeConfig == 'undefined' ? undefined : useRuntimeConfig()

export const db = drizzle(
  postgres(config?.dbUrl || process.env.NUXT_DB_URL),
  {
    schema: {
      users,
      userGroups,
      userGroupMemberships,
      specimens,
      geneGroups,
      pcrExperiments,
      plates,
      wells,
      projects,
      targets,
      genes,
      regions,
      cycles,
      harvestExperiments,
      plasmidExperiments,
      extractionExperiments,

      usersRelations,
      userGroupsRelations,
      userGroupMembershipsRelations,
      platesRelations,
      pcrExperimentsRelations,
      wellsRelations,
      projectsRelations,
      targetsRelations,
      regionsRelations,
      cyclesRelations,
      harvestExperimentsRelations,
      plasmidExperimentsRelations,
      extractionExperimentsRelations,
    }
  }
)

export interface RelationsConfig {
    one: {
      [relationName: string]: {
        fields: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        referenceTable: PgTableWithColumns<any>,
        references: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        relationName?: string,
      }
    },
    many: {
      [relationName: string]: {
        table: PgTableWithColumns<any>,
        schema: ZodObject<any>,
        fields: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        relationsConfig?: RelationsConfig,
        relationName?: string,
      }
    }
  }

export async function getRecordsFromTable (table: PgTableWithColumns<any>){
  const records = await db.select().from(table)
  return records
}
