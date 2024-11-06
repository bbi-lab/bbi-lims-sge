import { type InferSelectModel } from 'drizzle-orm'
import { pgTable, PgTableWithColumns, text, varchar } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import _ from 'lodash'
import { ZodObject } from 'zod'

export const geneGroups: PgTableWithColumns<any> = pgTable('gene_groups', {
  id: varchar('id').notNull().primaryKey(),
  abbreviation: varchar('abbreviation', { length: 255 }),
  externalNote: text('external_note'),
  pubmedIds: varchar('pubmed_ids', { length: 255 }),
  descComment: text('desc_comment'),
  descLabel: varchar('desc_label', { length: 255 }),
  descSource: varchar('desc_source', { length: 255 }),
  descGo: varchar('desc_go', { length: 255 }),
  typicalGene: varchar('typical_gene', { length: 255 }),
})

const selectGeneGroupSchema = createSelectSchema(geneGroups)

export const schemas: Record<string, ZodObject<any>> = {
  selectGeneGroupSchema,
}

export type GeneGroup = InferSelectModel<typeof geneGroups>
