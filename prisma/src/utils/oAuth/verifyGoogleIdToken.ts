import * as fs from 'fs'
import { OAuth2Client } from 'google-auth-library'
import ResolverError from '../resolverError'

const clientId = (() => {
  if (process.env.NODE_ENV === 'production') {
    const googleClientId = fs
      .readFileSync('/run/secrets/GOOGLE_CLIENT_ID')
      .toString()
    if (!googleClientId) {
      throw new ResolverError('GOOGLE_CLIENT_ID must be set in production.')
    }
    return googleClientId
  }
  return process.env.GOOGLE_CLIENT_ID as string
})()

const client = new OAuth2Client(clientId)

const verifyGoogleIdToken = async (token: string) => {
  var ticket
  try {
    ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    })
  } catch (e) {
    throw new ResolverError('Invalid ID token')
  }

  const payload = ticket.getPayload()
  if (!payload) {
    throw new ResolverError('Invalid ID token')
  }

  return payload
}

export default verifyGoogleIdToken
