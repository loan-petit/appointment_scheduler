import gql from 'graphql-tag'

import Appointment from './Appointment'

type Customer = {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  isBlackListed?: boolean
  appointments?: Appointment[]
}

export const CustomerFragments = {
  fields: gql`
    fragment CustomerFields on Customer {
      __typename
      id
      email
      firstName
      lastName
      phone
      address
      isBlackListed
    }
  `,
}

export default Customer
