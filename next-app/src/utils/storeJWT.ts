import Router from 'next/router'
import Cookies from 'js-cookie'

import AuthPayload from '../models/AuthPayload'

const storeJWT = (authPayload: AuthPayload) => {
  Cookies.set('token', authPayload.token, {
    expires: Math.floor(authPayload.expiresIn / (3600 * 24)),
  })
  Router.replace('/')
}

export default storeJWT
