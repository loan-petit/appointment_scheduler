import User from './User'

type AuthPayload = {
  token: string
  expiresIn: number
  user: User
}

export default AuthPayload
