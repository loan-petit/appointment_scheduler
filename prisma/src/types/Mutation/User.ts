import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { mutationField, stringArg, intArg } from '@nexus/schema'

import { JWT_SECRET, getUserId } from '../../utils/getUserId'
import { User } from '@prisma/client'
import { OAuthTokenInput } from '../OAuthToken'
import verifyGoogleIdToken from '../../utils/OAuth/verifyGoogleIdToken'

export const signup = mutationField('signup', {
  type: 'AuthPayload',
  args: {
    email: stringArg({ nullable: false }),
    firstName: stringArg({ nullable: false }),
    lastName: stringArg({ nullable: false }),
    password: stringArg(),
    passwordConfirmation: stringArg(),
    oAuthToken: OAuthTokenInput.asArg(),
  },
  resolve: async (
    _parent,
    { email, firstName, lastName, password, passwordConfirmation, oAuthToken },
    ctx,
  ) => {
    if (!password && !oAuthToken) {
      throw new Error(
        "Signup must be made using credentials or OAuth. Therefore 'password' or 'oAuthToken' must be set.",
      )
    }

    var user: User | null
    var username: string = `${firstName}${lastName}`.toLowerCase()

    // Generate an unique username
    do {
      user = await ctx.prisma.user.findOne({
        where: { username: username },
      })
      if (user) {
        if (!isNaN(Number(username.substr(username.length - 1)))) {
          username =
            username.substr(0, username.length - 1) +
            (Number(username[username.length - 1]) + 1).toString()
        } else {
          username += '1'
        }
      }
    } while (user)

    if (password !== passwordConfirmation) {
      throw new Error("'password' must match 'passwordConfirmation'")
    }

    const tokenPayload =
      oAuthToken && (await verifyGoogleIdToken(oAuthToken.idToken))

    user = await ctx.prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        password: password && (await hash(password, 10)),
        googleId: tokenPayload?.sub,
        ...(oAuthToken
          ? {
              oAuthToken: {
                create: { accessToken: oAuthToken.accessToken },
              },
            }
          : {}),
      },
    })

    if (!user) {
      throw Error('An unexpected error occurred')
    }

    return {
      token: sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: 86400 * 7,
      }),
      expiresIn: 86400 * 7,
      user,
    }
  },
})

export const signin = mutationField('signin', {
  type: 'AuthPayload',
  args: {
    email: stringArg(),
    password: stringArg(),
    oAuthToken: OAuthTokenInput.asArg(),
  },
  resolve: async (_parent, { email, password, oAuthToken }, ctx) => {
    var user: User | null = null

    if (email && password) {
      user = await ctx.prisma.user.findOne({
        where: {
          email,
        },
      })

      if (!user) {
        throw new Error(`No user found for email: ${email}`)
      }
      if (!user.password) {
        throw new Error('This user has no associated credentials.')
      }

      const passwordValid = await compare(password, user.password)
      if (!passwordValid) {
        throw new Error('Invalid password')
      }
    } else if (oAuthToken) {
      const tokenPayload = await verifyGoogleIdToken(oAuthToken.idToken)

      user = await ctx.prisma.user.findOne({
        where: {
          googleId: tokenPayload.sub,
        },
      })
    }

    if (!user) {
      throw new Error(`User not found`)
    }

    return {
      token: sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: 86400 * 7,
      }),
      expiresIn: 86400 * 7,
      user,
    }
  },
})

export const updateCurrentUser = mutationField('updateCurrentUser', {
  type: 'User',
  args: {
    email: stringArg(),
    firstName: stringArg(),
    lastName: stringArg(),
    websiteUrl: stringArg(),
    address: stringArg(),
    minScheduleNotice: intArg(),
    oldPassword: stringArg(),
    newPassword: stringArg(),
    newPasswordConfirmation: stringArg(),
    oAuthToken: OAuthTokenInput.asArg(),
  },
  resolve: async (
    _parent,
    {
      email,
      firstName,
      lastName,
      websiteUrl,
      address,
      minScheduleNotice,
      oldPassword,
      newPassword,
      newPasswordConfirmation,
      oAuthToken,
    },
    ctx,
  ) => {
    const userId = getUserId(ctx)
    const user = await ctx.prisma.user.findOne({
      where: {
        id: Number(userId),
      },
    })

    if (!user) {
      throw new Error('Could not authenticate user.')
    }

    var hashedPassword
    if (user.password && oldPassword && newPassword) {
      if (newPassword !== newPasswordConfirmation) {
        throw new Error("'newPassword' must match 'newPasswordConfirmation'")
      }

      const passwordValid = await compare(oldPassword, user.password)
      if (!passwordValid) {
        throw new Error('Invalid password')
      }
      hashedPassword = await hash(newPassword, 10)
    }

    var tokenPayload =
      oAuthToken && (await verifyGoogleIdToken(oAuthToken.idToken))

    return await ctx.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: email ?? undefined,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        websiteUrl,
        address,
        minScheduleNotice: minScheduleNotice ?? undefined,
        password: hashedPassword,
        googleId: tokenPayload?.sub,
        ...(oAuthToken
          ? {
              oAuthToken: {
                create: { accessToken: oAuthToken.accessToken },
              },
            }
          : {}),
      },
    })
  },
})
