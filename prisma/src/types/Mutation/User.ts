import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { mutationField, stringArg, intArg, nonNull } from '@nexus/schema'

import { JWT_SECRET, getUserId } from '../../utils/getUserId'
import { User } from '@prisma/client'
import { OAuthTokenInput } from '../OAuthToken'
import verifyGoogleIdToken from '../../utils/oAuth/verifyGoogleIdToken'
import ResolverError from '../../utils/resolverError'

export const signup = mutationField('signup', {
  type: 'AuthPayload',
  args: {
    email: nonNull(stringArg()),
    firstName: nonNull(stringArg()),
    lastName: nonNull(stringArg()),
    password: stringArg(),
    oAuthToken: OAuthTokenInput.asArg(),
  },
  resolve: async (
    _parent,
    { email, firstName, lastName, password, oAuthToken },
    ctx,
  ) => {
    if (!password && !oAuthToken) {
      throw new ResolverError(
        "Signup must be made using credentials or OAuth. Therefore 'password' or 'oAuthToken' must be set.",
      )
    }

    var user: User | null
    var username: string = `${firstName}${lastName}`.toLowerCase()

    // Generate an unique username
    do {
      user = await ctx.prisma.user.findUnique({
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
      throw new ResolverError('An unexpected error occurred')
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
      user = await ctx.prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        throw new ResolverError(`No user found for email: ${email}`)
      }
      if (!user.password) {
        throw new ResolverError('This user has no associated credentials.')
      }

      const passwordValid = await compare(password, user.password)
      if (!passwordValid) {
        throw new ResolverError('Invalid password')
      }
    } else if (oAuthToken) {
      const tokenPayload = await verifyGoogleIdToken(oAuthToken.idToken)

      user = await ctx.prisma.user.findUnique({
        where: {
          googleId: tokenPayload.sub,
        },
      })
    }

    if (!user) {
      throw new ResolverError(`User not found`)
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
      oAuthToken,
    },
    ctx,
  ) => {
    const userId = getUserId(ctx)
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    })

    if (!user) {
      throw new ResolverError('Could not authenticate user.')
    }

    var hashedPassword
    if (user.password && oldPassword && newPassword) {
      const passwordValid = await compare(oldPassword, user.password)
      if (!passwordValid) {
        throw new ResolverError('Invalid password')
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
