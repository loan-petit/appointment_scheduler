import { objectType, inputObjectType } from '@nexus/schema'

export const OAuthTokenInput = inputObjectType({
  name: 'OAuthTokenInput',
  definition(t) {
    t.string('accessToken', { nullable: false })
    t.string('refreshToken')
    t.string('idToken', { nullable: false })
  },
})

export const OAuthToken = objectType({
  name: 'OAuthToken',
  definition(t) {
    t.model.id()
    t.model.accessToken()
    t.model.refreshToken()
    t.model.user()
  },
})
