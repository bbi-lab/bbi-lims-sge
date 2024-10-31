import { type InferSelectModel, relations } from 'drizzle-orm'
import { boolean, pgTable, primaryKey, integer, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import { z, ZodObject } from 'zod'
import _ from 'lodash'
import { dateSchema } from '../helpers/schemas'

// tables 
export const users = pgTable('users', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: text('email').notNull().unique(),
  isAdmin: boolean('is_admin').notNull().default(false),
  password: text('password').notNull(),
  isVerified: boolean('is_verified').notNull().default(false),
  code: text('code').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const userGroups = pgTable('user_groups', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  name: varchar('name', { length: 255 }).notNull(),
})

export const userGroupMemberships = pgTable('user_group_memberships', {
  userId: uuid('user_id').notNull().references(() => users.id),
  userGroupId: integer('user_group_id').notNull().references(() => userGroups.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.userGroupId] }),
}))

// relations config
// defines M:M between users and groups
export const usersRelationsConfig: RelationsConfig = {
  one:{},
  many: {
    userGroupMemberships: {
      table: userGroupMemberships,
      schema: createSelectSchema(userGroupMemberships),
      fields: [userGroupMemberships.userId],
      relationsConfig: {
        one:{
          userGroup: {
            referenceTable: userGroups,
            fields: [userGroupMemberships.userGroupId],
            references: [userGroups.id],
          },
          user: {
            referenceTable: users,
            fields: [userGroupMemberships.userId],
            references: [users.id],
          }
        },
        many:{}
      }
    }
  }
}

// relations
export const usersRelations = relations(users, ({ many }) => (
  _.mapValues(usersRelationsConfig.many, (x) => {
    return many(x.table)
  })
))

export const userGroupsRelations = relations(userGroups, ({ many }) => ({
  userGroupMemberships: many(userGroupMemberships),
}))

export const userGroupMembershipsRelations = Object.freeze(relations(userGroupMemberships, ({ one }) => (
  _.mapValues(usersRelationsConfig.many.userGroupMemberships.relationsConfig.one, (x) => {
    return one(x.referenceTable, {
      fields: x.fields,
      references: x.references,
    })
  })
)))

// schemas
const selectUserSchema = createSelectSchema(users, {
  email: schema =>
    schema.email.email().regex(/^([\w.%-]+@[a-z0-9.-]+\.[a-z]{2,6})*$/i),
})

const verifyUserSchema = selectUserSchema.pick({
    email: true,
    code: true,
})

const loginSchema = selectUserSchema.pick({
    email: true,
    password: true,
})

const refreshTokensSchema = z.object({
  headers: z.object({
    authorization: z.string(),
  }),
})

const updateUserSchema = selectUserSchema.pick({
    name: true,
    email: true,
    password: true,
}).partial()

const newUserSchema = selectUserSchema.pick({
    name: true,
    email: true,
    password: true,
})

const adminUpdateUserSchema = selectUserSchema.extend({
  createdAt: dateSchema,
  updatedAt: dateSchema,
  userGroupMemberships: z.array(createSelectSchema(userGroupMemberships))
}).omit({
    id: true, 
    password: true, 
    code: true
})

export const schemas: Record<string, ZodObject<any>> = {
  selectUserSchema: selectUserSchema.omit({password: true, code: true}),
  adminUpdateUserSchema,
  newUserSchema,
  updateUserSchema,
  refreshTokensSchema,
  loginSchema,
}

const selectUserGroupSchema = createSelectSchema(userGroups)
const newUserGroupSchema = selectUserGroupSchema.pick({name: true})

export const userGroupSchemas: Record<string, ZodObject<any>> = {
  selectUserGroupSchema,
  newUserGroupSchema,
}

// types
export type User = InferSelectModel<typeof users>
export type NewUser = z.infer<typeof newUserSchema>
export type LoginUser = z.infer<typeof loginSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
export type AdminUpdateUser = z.infer<typeof adminUpdateUserSchema>
