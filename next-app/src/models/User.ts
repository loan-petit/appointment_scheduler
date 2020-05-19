import gql from 'graphql-tag'

import Event from './Event'
import RecurrentAvailabilitySlot from './RecurrentAvailabilitySlot'

type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  websiteUrl?: string
  address?: string
  minScheduleNotice: number
  events: Event[]
  recurrentAvailabilities: RecurrentAvailabilitySlot[]
}

export const UserFragments = {
  fields: gql`
    fragment UserFields on User {
      __typename
      id
      email
      firstName
      lastName
      websiteUrl
      address
      minScheduleNotice
    }
  `,
}

export default User
