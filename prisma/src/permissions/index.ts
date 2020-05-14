import { rule, shield } from 'graphql-shield'
import { getUserId } from '../utils/getUserId'

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
  isEventOwner: rule()(async (_parent, args, ctx) => {
    const userId = getUserId(ctx)
    const owner = await ctx.prisma.event
      .findOne({
        where: {
          id: args.where.id,
        },
      })
      .owner()
    return userId === owner.id
  }),
}

export const permissions = shield({
  Query: {
    user: rules.isAuthenticatedUser,
    users: rules.isAuthenticatedUser,
    me: rules.isAuthenticatedUser,
  },
  Mutation: {
    updateCurrentUser: rules.isAuthenticatedUser,
    deleteOneUser: rules.isCurrentUser,
    createOneEvent: rules.isAuthenticatedUser,
    updateOneEvent: rules.isEventOwner,
    deleteOneEvent: rules.isEventOwner,
  },
})
