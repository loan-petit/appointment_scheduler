import { rule, shield } from 'graphql-shield'
import { getUserId } from '../utils/getUserId'

const isModelOwner = async (args: any, model: any, userId?: string) => {
  try {
    const user = await model
      .findOne({
        where: {
          id: args.where.id,
        },
      })
      .user()
    return userId === user.id
  } catch (err) {
    return Boolean(userId)
  }
}

const rules = {
  isAuthenticatedUser: rule()((_parent, _args, ctx) => {
    const userId = getUserId(ctx)
    return Boolean(userId)
  }),
  isCurrentUser: rule()(async (_parent, args, ctx) => {
    const userId = getUserId(ctx)
    const user = await ctx.prisma.user.findOne({
      where: {
        id: args.where.id,
      },
    })
    return Number(userId) === user.id
  }),
  isEventOwner: rule()(async (_parent, args, ctx) =>
    isModelOwner(args, ctx.prisma.event, getUserId(ctx)),
  ),
  isRecurrentAvailabilityOwner: rule()((_parent, args, ctx) =>
    isModelOwner(args, ctx.prisma.recurrentAvailability, getUserId(ctx)),
  ),
  isAvailabilityOwner: rule()((_parent, args, ctx) =>
    isModelOwner(args, ctx.prisma.availability, getUserId(ctx)),
  ),
}

export const permissions = shield({
  Query: {
    me: rules.isAuthenticatedUser,
    user: rules.isAuthenticatedUser,
    users: rules.isAuthenticatedUser,
  },
  Mutation: {
    updateCurrentUser: rules.isAuthenticatedUser,
    deleteOneUser: rules.isCurrentUser,

    // Event
    createOneEvent: rules.isAuthenticatedUser,
    updateOneEvent: rules.isEventOwner,
    upsertOneEvent: rules.isEventOwner,
    deleteOneEvent: rules.isEventOwner,

    // RecurrentAvailability
    createOneRecurrentAvailability: rules.isAuthenticatedUser,
    updateOneRecurrentAvailability: rules.isRecurrentAvailabilityOwner,
    upsertOneRecurrentAvailability: rules.isRecurrentAvailabilityOwner,
    deleteOneRecurrentAvailability: rules.isRecurrentAvailabilityOwner,

    // Availability
    createOneAvailability: rules.isAuthenticatedUser,
    updateOneAvailability: rules.isAvailabilityOwner,
    upsertOneAvailability: rules.isAvailabilityOwner,
    deleteOneAvailability: rules.isAvailabilityOwner,
  },
})
