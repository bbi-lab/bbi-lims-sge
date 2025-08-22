import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'

import { type PgTable, type AnyPgColumn } from 'drizzle-orm/pg-core'
import {users, userGroups, userGroupMemberships} from '../db/schema/user'

import {pcrExperiments} from '../db/schema/sge/pcr-experiment'
import {plates, viewPlatesWithWellCounts} from '../db/schema/sge/plate'
import {wellContents, wells, wellContentSources, wellables} from '../db/schema/sge/well'
import {projects} from '../db/schema/sge/project'
import {targets} from '../db/schema/sge/target'
import {genes} from '../db/schema/sge/gene'
import {regions} from '../db/schema/sge/region'
import {cycles} from '../db/schema/sge/cycle'
import {pellets} from '../db/schema/sge/pellet'
import {sgRnaPlasmids, snvLibPlasmids} from '../db/schema/sge/plasmid'
import {nucleicAcids} from '../db/schema/sge/nucleic-acid'
import {lots} from '../db/schema/sge/lots'
import { transfectExperiments, transfectTargets, transfectLotUsage } from '../db/schema/sge/transfect-experiment'
import { sgRnaCloningExperiments, snvLibCloningExperiments } from '../db/schema/sge/plasmid-experiment'
import { extractionExperiments, extractionLotUsage } from '../db/schema/sge/extraction-experiment'
import * as sgeRelations from '../db/schema/sge/relations'
import {usersRelations, userGroupsRelations, userGroupMembershipsRelations} from '../db/schema/relations'
import {ZodObject} from 'zod'
import _ from 'lodash'
import { reagents } from '../db/schema/sge/reagents'
import { amplificationPrimers, linearizationPrimers, homologyArmPrimers, indexPrimers, preseq1Primers, preseq2Primers } from '../db/schema/sge/primer'
import { sequencingRunExternalSamples, sequencingRuns, sequencingRunSamples, viewSequencingRunAllSamples } from '../db/schema/sge/sequencing-run'
import { sgRnaOligos } from '../db/schema/sge/oligos'
import { externalSamples } from '../db/schema/sge/external-samples'

// Evertyhing from relations module except relationsConfigs will be included in schema (assumes all other exports are relationships)
const { relationsConfigs, ...sgeRelationships } = sgeRelations

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
  wellables,
  wellContentSources,
  projects,
  targets,
  genes,
  regions,
  cycles,
  // plasmids,
  snvLibPlasmids,
  sgRnaPlasmids,
  nucleicAcids,
  sgRnaOligos,
  pellets,
  lots,
  reagents,
  transfectExperiments,
  transfectTargets,
  transfectLotUsage,
  // plasmidExperiments,
  sgRnaCloningExperiments,
  snvLibCloningExperiments,
  extractionExperiments,
  extractionLotUsage,
  amplificationPrimers,
  linearizationPrimers,
  homologyArmPrimers,
  preseq1Primers,
  preseq2Primers,
  indexPrimers,
  sequencingRuns,
  sequencingRunSamples,
  externalSamples,
  sequencingRunExternalSamples,

  //views
  viewPlatesWithWellCounts,
  viewSequencingRunAllSamples,

  // relations
  usersRelations,
  userGroupsRelations,
  userGroupMembershipsRelations,
  ...sgeRelationships,
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
