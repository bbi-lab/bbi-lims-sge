import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'

import { type PgTable, type AnyPgColumn } from 'drizzle-orm/pg-core'
import {users, userGroups, userGroupMemberships} from '../db/schema/user'

import {pcrExperiments} from '../db/schema/sge/pcr-experiment'
import {plates, viewPlatesWithWellCounts} from '../db/schema/sge/plate'
import {wellContents, wells, wellContentSources} from '../db/schema/sge/well'
import {projects} from '../db/schema/sge/project'
import {targets} from '../db/schema/sge/target'
import {genes} from '../db/schema/sge/gene'
import {regions} from '../db/schema/sge/region'
import {cycles} from '../db/schema/sge/cycle'
import {pellets} from '../db/schema/sge/pellet'
import {plasmids} from '../db/schema/sge/plasmid'
import {nucleicAcids} from '../db/schema/sge/nucleic-acid'
import {lots} from '../db/schema/sge/lots'
import { transfectExperiments, transfectTargets, transfectLotUsage } from '../db/schema/sge/transfect-experiment'
import { plasmidExperiments } from '../db/schema/sge/plasmid-experiment'
import { extractionExperiments, extractionLotUsage } from '../db/schema/sge/extraction-experiment'
import * as sgeRelations from '../db/schema/sge/relations'
import {usersRelations, userGroupsRelations, userGroupMembershipsRelations} from '../db/schema/relations'
import {ZodObject} from 'zod'
import _ from 'lodash'
import { reagents } from '../db/schema/sge/reagents'
import { amplificationPrimers, linearizationPrimers, homologyArmPrimers, indexPrimers } from '../db/schema/sge/primer'
import { sequencingRuns } from '../db/schema/sge/sequencing-run'

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
  wellContents,
  wellContentSources,
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
  transfectExperiments,
  transfectTargets,
  transfectLotUsage,
  plasmidExperiments,
  extractionExperiments,
  extractionLotUsage,
  amplificationPrimers,
  linearizationPrimers,
  homologyArmPrimers,
  indexPrimers,
  sequencingRuns,

  //views
  viewPlatesWithWellCounts,

  // relations
  usersRelations,
  userGroupsRelations,
  userGroupMembershipsRelations,
  platesRelations: sgeRelations.platesRelations,
  pcrExperimentsRelations: sgeRelations.pcrExperimentsRelations,
  wellsRelations: sgeRelations.wellsRelations,
  wellContentsRelations: sgeRelations.wellContentsRelations,
  wellContentSourcesRelations: sgeRelations.wellContentSourcesRelations,
  // wellSourcesRelations: sgeRelations.wellSourcesRelations,
  projectsRelations: sgeRelations.projectsRelations,
  targetsRelations: sgeRelations.targetsRelations,
  regionsRelations: sgeRelations.regionsRelations,
  genesRelations: sgeRelations.genesRelations,
  cyclesRelations: sgeRelations.cyclesRelations,
  plasmidsRelations: sgeRelations.plasmidsRelations,
  nucleicAcidsRelations: sgeRelations.nucleicAcidsRelations,
  pelletsRelations: sgeRelations.pelletsRelations,
  lotsRelations: sgeRelations.lotsRelations,
  transfectExperimentsRelations: sgeRelations.transfectExperimentsRelations,
  transfectTargetsRelations: sgeRelations.transfectTargetsRelations,
  transfectLotUsageRelations: sgeRelations.transfectLotUsageRelations,
  plasmidExperimentsRelations: sgeRelations.plasmidExperimentsRelations,
  extractionExperimentsRelations: sgeRelations.extractionExperimentsRelations,
  extractionLotUsageRelations: sgeRelations.extractionLotUsageRelations,
  amplificationPrimersRelations: sgeRelations.amplificationPrimersRelations,
  linearizationPrimersRelations: sgeRelations.linearizationPrimersRelations,
  homologyArmPrimersRelations: sgeRelations.homologyArmPrimersRelations,
  indexPrimersRelations: sgeRelations.indexPrimersRelations,
  sequencingRunsRelations: sgeRelations.sequencingRunsRelations,
}

const ssl = config?.ssl != null ? config.ssl
    : (process.env.NUXT_DB_SSL != null ? process.env.NUXT_DB_SSL.toLowerCase() == 'true' : false)
const pool = new pg.Pool({
  host: config?.dbHost || process.env.NUXT_DB_HOST || 'localhost',
  port: config?.dbPort || (process.env.NUXT_DB_PORT ? parseInt(process.env.NUXT_DB_PORT) : null) || 5432,
  database: config?.dbDatabaseName || process.env.NUXT_DB_DATABASE_NAME || 'sge_prod',
  user: config?.dbUsername || process.env.NUXT_DB_USERNAME || 'postgres',
  password: config?.dbPassword || process.env.NUXT_DB_PASSWORD || 'postgres',
  ssl: ssl ? {
    rejectUnauthorized: false
  } : false
})

// Add logger: true to options to get query logging.
export const db = drizzle(pool, {schema: schema})

export function useDrizzle() {
  return db
}

export interface RelationsConfig {
    one?: {
      [relationName: string]: {
        fields: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        referenceTable: PgTable<any>,
        references: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        relationName?: string,
      }
    },
    many?: {
      [relationName: string]: {
        table: PgTable<any>,
        schema: ZodObject<any>,
        fields: [AnyPgColumn<any>, ...AnyPgColumn<any>[]],
        relationsConfig?: RelationsConfig,
        relationName?: string,
      }
    },
    oneToOne?: {
      [relationName: string]: {
        table: PgTable<any>,
      }
    },
  }
