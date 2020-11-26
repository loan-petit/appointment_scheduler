import { objectType, inputObjectType } from '@nexus/schema'

export const OAuthTokenInput = inputObjectType({
  name: 'OAuthTokenInput',
  definition (t) {
    t.nonNull.string('accessToken')
    t.string('refreshToken')
    t.nonNull.string('idToken')
  },
})

export const OAuthToken = objectType({
  name: 'OAuthToken',
  definition (t) {
    t.model.id()
    t.model.accessToken()
    t.model.refreshToken()
    t.model.user()
  },
})
