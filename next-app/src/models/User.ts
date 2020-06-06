import gql from 'graphql-tag'

import AppointmentType from './AppointmentType'
import RecurrentAvailability from './RecurrentAvailability'

type User = {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
  websiteUrl?: string
  phone?: string
  address?: string
  minScheduleNotice: number
  appointmentTypes?: AppointmentType[]
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
  publicFields: gql`
    fragment UserPublicFields on User {
      id
      firstName
      lastName
      websiteUrl
      address
    }
  `,
}

export default User
