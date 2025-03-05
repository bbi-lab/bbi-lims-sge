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
import {plasmids} from '../db/schema/sge/plasmid'
import {nucleicAcids} from '../db/schema/sge/nucleic-acid'
import {lots} from '../db/schema/sge/lots'
import {storageBoxes} from '../db/schema/sge/storage-box'
import { transfectExperiments, transfectTargets, transfectLotUsage } from '../db/schema/sge/transfect-experiment'
import { plasmidExperiments } from '../db/schema/sge/plasmid-experiment'
import { extractionExperiments } from '../db/schema/sge/extraction-experiment'
import * as sgeRelations from '../db/schema/sge/relations'
import {usersRelations, userGroupsRelations, userGroupMembershipsRelations} from '../db/schema/relations'
import {ZodObject} from 'zod'
import _ from 'lodash'
import { reagents } from '../db/schema/sge/reagents'
import { amplificationPrimers, linearizationPrimers, homologyArmPrimers } from '../db/schema/sge/primer'


// By checking whether useRuntimeConfig is defined, we support use outside the Nuxt lifecycle.
const config = typeof useRuntimeConfig == 'undefined' ? undefined : useRuntimeConfig()

export const schema = {
  // tables
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
  plasmids,
  nucleicAcids,
  pellets,
  lots,
  reagents,
  storageBoxes,
  transfectExperiments,
  transfectTargets,
  transfectLotUsage,
  plasmidExperiments,
  extractionExperiments,
  amplificationPrimers,
  linearizationPrimers,
  homologyArmPrimers,

  // relations
  usersRelations,
  userGroupsRelations,
  userGroupMembershipsRelations,
  platesRelations: sgeRelations.platesRelations,
  pcrExperimentsRelations: sgeRelations.pcrExperimentsRelations,
  wellsRelations: sgeRelations.wellsRelations,
  projectsRelations: sgeRelations.projectsRelations,
  targetsRelations: sgeRelations.targetsRelations,
  regionsRelations: sgeRelations.regionsRelations,
  genesRelations: sgeRelations.genesRelations,
  cyclesRelations: sgeRelations.cyclesRelations,
  plasmidsRelations: sgeRelations.plasmidsRelations,
  nucleicAcidsRelations: sgeRelations.nucleicAcidsRelations,
  pelletsRelations: sgeRelations.pelletsRelations,
  lotsRelations: sgeRelations.lotsRelations,
  storageBoxesRelations: sgeRelations.storageBoxesRelations,
  transfectExperimentsRelations: sgeRelations.transfectExperimentsRelations,
  transfectTargetsRelations: sgeRelations.transfectTargetsRelations,
  transfectLotUsageRelations: sgeRelations.transfectLotUsageRelations,
  plasmidExperimentsRelations: sgeRelations.plasmidExperimentsRelations,
  extractionExperimentsRelations: sgeRelations.extractionExperimentsRelations,
  amplificationPrimersRelations: sgeRelations.amplificationPrimersRelations,
  linearizationPrimersRelations: sgeRelations.linearizationPrimersRelations,
  homologyArmPrimersRelations: sgeRelations.homologyArmPrimersRelations,
}

const DB_URL = config ? `postgresql://${config.dbUsername}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbDatabaseName}` : `postgresql://${process.env.NUXT_DB_USER}:${process.env.NUXT_DB_PASSWORD}@${process.env.NUXT_DB_HOST}:${process.env.NUXT_DB_PORT}/${process.env.NUXT_DB_DATABASE_NAME}`

export const db = drizzle(
  postgres(DB_URL),
  {
    schema
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
