import crypto from 'node:crypto'
import { type NewUser, type UpdateUser, type AdminUpdateUser, type User, users, schemas, userGroups, usersRelationsConfig } from '@/server/db/schema/user'
import { db } from '@/server/utils/db'
// import { sendVerificationEmail } from '@/utils/email'
import { sha256 } from '@/server/utils/hash'
import argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import { ZodObject } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import _ from 'lodash'

export async function getAllUsers() {
    return await db.query.users.findMany(
      {
        with: {
          userGroupMemberships: {
            columns: {}, // excluding columns from many-to-many table
            with: {
              userGroup: true
            }
          }
        }
      }
    )
}

export async function getUserGroups() {
  return await await db.select().from(userGroups)
}
export async function getUserById(userId: string) {
  const [user] = await db.query.users.findMany(
    {
      where: () => eq(users.id, userId),
      with: {
        userGroupMemberships: true
      },
      limit: 1
    }
  )
  return user
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return user
}

export async function addUser(user: NewUser) {
  const { password, ...userDetails } = user
  const code = crypto.randomBytes(32).toString('hex')
  const hashedPassword = await argon2.hash(password) 

  const [newUser] = await db
    .insert(users)
    .values({
      ...userDetails,
      password: hashedPassword,
      code,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      code: users.code,
      isVerified: users.isVerified,
      isAdmin: users.isAdmin,
    })

  if (!newUser) {
    throw createError({
        statusCode: 400,
        statusMessage: 'Failed to add user'
    })
  }

  return { user: newUser, code }
}

export async function verifyUser(email: string, code: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (!user)
    throw createError({
        statusCode: 404,
        statusMessage: 'USER_NOT_FOUND'
    })

  if (user.isVerified) {
    throw createError({
        statusCode: 409,
        statusMessage: 'USER_ALREADY_VERIFIED'
    })
  }

  const isVerified = sha256.verify(code, user.code)

  if (!isVerified) {
    throw createError({
        statusCode: 401,
        statusMessage: 'UNAUTHORIZED'
    })
  }

  const [updatedUser] = await db
    .update(users)
    .set({ isVerified })
    .where(eq(users.email, email))
    .returning({ id: users.id })

  if (!updatedUser) {
    throw createError({
        statusCode: 409,
        statusMessage: 'INTERNAL_ERROR'
    })
  }
}

export async function getAllVerifiedUsersInfo() {
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.isVerified, true))
}

export async function deleteUser(email: string) {
  const user = await getUserByEmail(email)

  if (!user)
    throw createError({
        statusCode: 404,
        statusMessage: 'USER_NOT_FOUND'
    })

  const [deletedUser] = await db.delete(users).where(eq(users.email, email)).returning({
    id: users.id,
    name: users.name,
    email: users.email,
  })

  return deletedUser
}

export async function updateUser(user: User, { name, email, password }: UpdateUser) {
  let code: string | undefined
  let hashedCode: string | undefined

  if (email) {
    const user = await getUserByEmail(email)

    if (user) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Email already in use'
        })
    }

    code = crypto.randomBytes(32).toString('hex')
    hashedCode = sha256.hash(code)
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      name,
      password,
      email,
      code: hashedCode,
      isVerified: hashedCode ? false : user.isVerified,
    })
    .where(eq(users.email, user.email))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      isAdmin: users.isAdmin,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })

  if (!updatedUser) {

    throw createError({
        statusCode: 404,
        statusMessage: 'USER_NOT_FOUND'
    })
  }

  if (email && code) {
    // const { NUXT_API_BASE } = process.env
    // const status = await sendVerificationEmail(
    //   API_BASE_URL,
    //   updatedUser.name,
    //   updatedUser.email,
    //   code,
    // )

    // if (status !== 200) {
    //   await db
    //     .update(users)
    //     .set({ email: user.email, isVerified: user.isVerified })
    //     .where(eq(users.email, updatedUser.email))
    //     .returning()
    //   throw new BackendError('BAD_REQUEST', {
    //     message: 'Email could not be updated',
    //   })
    // }
  }

  return updatedUser
}

export async function adminUpdateUser(userId: string, values: AdminUpdateUser) {
  if (values.email) {
    const existingUser = await getUserByEmail(values.email)

    if (existingUser.id != userId) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Email already in use'
        })
    }
  }

  const [updatedUser] = await db
    .update(users)
    .set(values)
    .where(eq(users.id, userId))
    .returning()

  if (!updatedUser) {
    throw createError({
        statusCode: 404,
        statusMessage: 'USER_NOT_FOUND'
    })
  }

  return updatedUser
}

export const getUserJsonSchema = async (schemaName: string, id?: string) => {
  if (_.has(schemas, schemaName)) {
    const currentSchema = schemas[schemaName] as ZodObject<any>

    // generate JSON Schema from Zod object
    const jsonSchema = zodToJsonSchema(currentSchema, { $refStrategy: 'none' })

    // refine JSON Schema based on relations
    await refineJsonSchema(jsonSchema, usersRelationsConfig, id)
    
    return jsonSchema
  }
  else {
      return null
  }
}
