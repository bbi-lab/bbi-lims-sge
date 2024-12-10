import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { type PgTableWithColumns, type AnyPgColumn } from 'drizzle-orm/pg-core'
import {users, userGroups, userGroupMemberships} from '../db/schema/user';

import {pcrExperiments} from '../db/schema/sge/pcr-experiment'
import {plates} from '../db/schema/sge/plate'
import {wells} from '../db/schema/sge/well'
import {projects} from '../db/schema/sge/project'
import {targets} from '../db/schema/sge/target'
import {genes} from '../db/schema/sge/gene'
import {regions} from '../db/schema/sge/region'
import {cycles} from '../db/schema/sge/cycle'
import {pellets} from '../db/schema/sge/pellet'
import {storageBoxes} from '../db/schema/sge/storage-box'
import { transfectExperiments, transfectTargets } from '../db/schema/sge/transfect-experiment'
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
  pelletsRelations,
  storageBoxesRelations,
  plasmidExperimentsRelations,
  transfectExperimentsRelations,
  transfectTargetsRelations,
  extractionExperimentsRelations,
} from '../db/schema/sge/relations'
import {usersRelations, userGroupsRelations, userGroupMembershipsRelations} from '../db/schema/relations'
import {ZodObject} from 'zod'
import _ from 'lodash'


// By checking whether useRuntimeConfig is defined, we support use outside the Nuxt lifecycle.
const config = typeof useRuntimeConfig == 'undefined' ? undefined : useRuntimeConfig()

export const schemaTables = {
  users,
  userGroups,
  userGroupMemberships,
  pcrExperiments,
  plates,
  wells,
  projects,
  targets,
  genes,
  regions,
  cycles,
  pellets,
  storageBoxes,
  transfectExperiments,
  transfectTargets,
  plasmidExperiments,
  extractionExperiments,
}

export const schemaRelations = {
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
  pelletsRelations,
  storageBoxesRelations,
  transfectExperimentsRelations,
  transfectTargetsRelations,
  plasmidExperimentsRelations,
  extractionExperimentsRelations,
}

export const db = drizzle(
  postgres(config?.dbUrl || process.env.NUXT_DB_URL),
  {schema: {...schemaTables, ...schemaRelations}}
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
