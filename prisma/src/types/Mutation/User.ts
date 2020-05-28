import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { mutationField, stringArg, intArg, idArg } from 'nexus'

import { JWT_SECRET, getUserId } from '../../utils/getUserId'

export const signup = mutationField('signup', {
  type: 'AuthPayload',
  args: {
    email: stringArg({ nullable: false }),
    firstName: stringArg({ nullable: false }),
    lastName: stringArg({ nullable: false }),
    password: stringArg({ nullable: false }),
    passwordConfirmation: stringArg({ nullable: false }),
  },
  resolve: async (
    _parent,
    { email, firstName, lastName, password, passwordConfirmation },
    ctx,
  ) => {
    if (password !== passwordConfirmation) {
      throw new Error("'password' must match 'passwordConfirmation'")
    }

    const hashedPassword = await hash(password, 10)

    var user
    var username: string = `${firstName}${lastName}`.toLowerCase()
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

    user = await ctx.prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        password: hashedPassword,
      },
    })

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
    email: stringArg({ nullable: false }),
    password: stringArg({ nullable: false }),
  },
  resolve: async (_parent, { email, password }, ctx) => {
    const user = await ctx.prisma.user.findOne({
      where: {
        email,
      },
    })

    if (!user) {
      throw new Error(`No user found for email: ${email}`)
    }

    const passwordValid = await compare(password, user.password)
    if (!passwordValid) {
      throw new Error('Invalid password')
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
    websiteUrl: stringArg({ nullable: true }),
    address: stringArg({ nullable: true }),
    minScheduleNotice: intArg({ nullable: true }),
    oldPassword: stringArg(),
    newPassword: stringArg(),
    newPasswordConfirmation: stringArg(),
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
    if (oldPassword && newPassword) {
      if (newPassword !== newPasswordConfirmation) {
        throw new Error("'newPassword' must match 'newPasswordConfirmation'")
      }

      const passwordValid = await compare(oldPassword, user.password)
      if (!passwordValid) {
        throw new Error('Invalid password')
      }
      hashedPassword = await hash(newPassword, 10)
    }

    const updatedUser = await ctx.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email,
        firstName,
        lastName,
        websiteUrl,
        address,
        minScheduleNotice,
        password: hashedPassword,
      },
    })

    return updatedUser
  },
})
