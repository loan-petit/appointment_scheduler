import gql from 'graphql-tag'

import Event from './Event'
import RecurrentAvailability from './RecurrentAvailability'

type User = {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
  websiteUrl?: string
  address?: string
  minScheduleNotice: number
  events?: Event[]
  recurrentAvailabilities?: RecurrentAvailability[]
}

export const UserFragments = {
  fields: gql`
    fragment UserFields on User {
      __typename
      id
      email
      username
      firstName
      lastName
      websiteUrl
      address
      minScheduleNotice
    }
  `,
}

export default User
