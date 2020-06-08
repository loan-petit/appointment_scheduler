import { OAuth2Client } from 'google-auth-library'

const clientId = process.env.GOOGLE_CLIENT_ID as string
const client = new OAuth2Client(clientId)

const verifyGoogleIdToken = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientId,
  })

  const payload = ticket.getPayload()

  if (!payload) {
    throw Error('id_token is invalid')
  }
  return payload
}

export default verifyGoogleIdToken
