import * as fs from 'fs'
import { verify } from 'jsonwebtoken'

import { Context } from '../context'
import ResolverError from './resolverError'

export const JWT_SECRET = (() => {
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = fs.readFileSync('/run/secrets/JWT_SECRET').toString()
    if (!jwtSecret) {
      throw new ResolverError('JWT_SECRET must be set in production.')
    }
    return jwtSecret
  }
  return process.env.JWT_SECRET as string
})()

interface Token {
  userId: string
}

export function getUserId(context: Context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const verifiedToken = verify(token, JWT_SECRET) as Token
    return verifiedToken && verifiedToken.userId
  }
}
